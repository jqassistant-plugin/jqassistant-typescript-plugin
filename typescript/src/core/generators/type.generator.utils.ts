import {Integer, Session} from "neo4j-driver";

import {LCETypeParameterDeclaration} from "../concepts/type-parameter.concept";
import {
    LCEType,
    LCETypeDeclared,
    LCETypeFunction,
    LCETypeIntersection,
    LCETypeLiteral,
    LCETypeNotIdentified,
    LCETypeObject,
    LCETypeParameter,
    LCETypePrimitive,
    LCETypeTuple,
    LCETypeUnion,
} from "../concepts/type.concept";
import {ConnectionIndex, ConnectionProperties} from "../connection-index";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createFunctionParameterNode} from "./function.generator.utils";

/**
 * Recursively creates type nodes for given `LCEType` and registers connection information within the `ConnectionIndex`.
 * @param type `LCEType` for which nodes are created
 * @param connectionIndex index for registering connections to types (for later creation)
 * @param parentNode node which will be related to the type node
 * @param connectionProps properties of connection that will be registered from parent to type node
 * @param parentTypeParamNodes type parameter of parent class, interface or type alias
 * @param methodTypeParamNodes type parameters of parent method
 */
export async function createTypeNode(
    type: LCEType,
    neo4jSession: Session,
    connectionIndex: ConnectionIndex,
    parentNode: Integer,
    connectionProps: ConnectionProperties,
    parentTypeParamNodes: Map<string, Integer> = new Map(),
    methodTypeParamNodes: Map<string, Integer> = new Map()
): Promise<void> {
    // NOTE: every newly created type node must be registered at the connectionIndex for a connection

    if (type instanceof LCETypePrimitive) {
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            MERGE (type:TS:Type:Primitive {name: $name})
            RETURN id(type)
            `,
                {name: type.name}
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);
    } else if (type instanceof LCETypeDeclared) {
        const typeNodeProps = {
            referencedFqn: type.fqn,
            internal: !PathUtils.isExternal(PathUtils.extractFQNPath(type.fqn)),
        };
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (type:TS:Type:Declared $typeNodeProps)
            RETURN id(type)
            `,
                {typeNodeProps: typeNodeProps}
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);

        // add potential type arguments
        for (let i = 0; i < type.typeArguments.length; i++) {
            const typeArg = type.typeArguments[i];
            await createTypeNode(
                typeArg,
                neo4jSession,
                connectionIndex,
                typeNodeId,
                {name: ":HAS_TYPE_ARGUMENT", props: {index: i}},
                parentTypeParamNodes,
                methodTypeParamNodes
            );
        }
        connectionIndex.referenceNodes.set(typeNodeId, [type.fqn, {name: ":REFERENCES", props: {}}]);
    } else if (type instanceof LCETypeUnion || type instanceof LCETypeIntersection) {
        const typeNodeId =
            type instanceof LCETypeUnion
                ? Utils.getNodeIdFromQueryResult(
                    await neo4jSession.run(
                        `
            CREATE (type:TS:Type:Union)
            RETURN id(type)
            `
                    )
                )
                : Utils.getNodeIdFromQueryResult(
                    await neo4jSession.run(
                        `
            CREATE (type:TS:Type:Intersection)
            RETURN id(type)
            `
                    )
                );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);

        // create constituent types of union/intersection
        for (const subType of type.types) {
            await createTypeNode(
                subType,
                neo4jSession,
                connectionIndex,
                typeNodeId,
                {name: ":CONTAINS", props: {}},
                parentTypeParamNodes,
                methodTypeParamNodes
            );
        }
    } else if (type instanceof LCETypeObject) {
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (type:TS:Type:Object)
            RETURN id(type)
            `
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);

        // create constituent types of union/intersection
        for (const [name, memberType] of type.members.entries()) {
            await createTypeNode(
                memberType,
                neo4jSession,
                connectionIndex,
                typeNodeId,
                {name: ":HAS_MEMBER", props: {name: name}},
                parentTypeParamNodes,
                methodTypeParamNodes
            );
        }
    } else if (type instanceof LCETypeFunction) {
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (type:TS:Type:Function)
            RETURN id(type)
            `
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);

        // create function type parameter nodes and connections
        const newParentTypeParamNodes = new Map([...parentTypeParamNodes, ...methodTypeParamNodes]);
        const functionTypeParamNodes = await createTypeParameterNodes(type.typeParameters, neo4jSession, connectionIndex, newParentTypeParamNodes);
        for (const typeParamNodeId of functionTypeParamNodes.values()) {
            await neo4jSession.run(
                `
                MATCH (funcType)
                MATCH (typeParam)
                WHERE id(funcType) = $typeNodeId AND id(typeParam) = $typeParamNodeId
                CREATE (funcType)-[:DECLARES]->(typeParam)
                RETURN typeParam
                `,
                {typeNodeId: typeNodeId, typeParamNodeId: typeParamNodeId}
            );
        }

        // create function parameter nodes and connections
        for (const param of type.parameters) {
            const paramNodeId = await createFunctionParameterNode(
                {
                    index: param.index,
                    name: param.name,
                    type: param.type,
                    optional: param.optional,
                    decorators: [],
                },
                neo4jSession,
                connectionIndex,
                newParentTypeParamNodes,
                functionTypeParamNodes
            );
            await neo4jSession.run(
                `
                MATCH (funcType)
                MATCH (param)
                WHERE id(funcType) = $typeNodeId AND id(param) = $paramNodeId
                CREATE (funcType)-[:HAS]->(param)
                RETURN param
                `,
                {typeNodeId: typeNodeId, paramNodeId: paramNodeId}
            );
        }

        // create return type node
        await createTypeNode(
            type.returnType,
            neo4jSession,
            connectionIndex,
            typeNodeId,
            {name: ":RETURNS", props: {}},
            newParentTypeParamNodes,
            functionTypeParamNodes
        );
    } else if (type instanceof LCETypeParameter) {
        if (methodTypeParamNodes.has(type.name)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            connectionIndex.connectionsToCreate.push([parentNode, methodTypeParamNodes.get(type.name)!, connectionProps]);
        } else if (parentTypeParamNodes.has(type.name)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            connectionIndex.connectionsToCreate.push([parentNode, parentTypeParamNodes.get(type.name)!, connectionProps]);
        }
    } else if (type instanceof LCETypeLiteral) {
        const typeNodeProps = {
            value: type.value,
        };
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (type:TS:Type:Literal $typeNodeProps)
            RETURN id(type)
            `,
                {typeNodeProps: typeNodeProps}
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);
    } else if (type instanceof LCETypeTuple) {
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (type:TS:Type:Tuple)
            RETURN id(type)
            `
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);

        // create constituent types of tuple
        for (let i = 0; i < type.types.length; i++) {
            const subType = type.types[i];
            await createTypeNode(
                subType,
                neo4jSession,
                connectionIndex,
                typeNodeId,
                {name: ":CONTAINS", props: {index: i}},
                parentTypeParamNodes,
                methodTypeParamNodes
            );
        }
    } else if (type instanceof LCETypeNotIdentified) {
        const typeNodeProps = {
            identifier: type.identifier,
        };
        const typeNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (type:TS:Type:NotIdentified $typeNodeProps)
            RETURN id(type)
            `,
                {typeNodeProps: typeNodeProps}
            )
        );
        connectionIndex.connectionsToCreate.push([parentNode, typeNodeId, connectionProps]);
    }
}

/**
 * Creates type nodes for the given type parameters.
 * @param typeParameters `LCETypeParameterDeclaration`s for which nodes are created
 * @param connectionIndex index for registering connections (for later creation)
 * @param parentTypeParamNodes type parameter of parent class, interface or type alias
 * @returns
 */
export async function createTypeParameterNodes(
    typeParameters: LCETypeParameterDeclaration[],
    neo4jSession: Session,
    connectionIndex: ConnectionIndex,
    parentTypeParamNodes: Map<string, Integer> = new Map()
): Promise<Map<string, Integer>> {
    const result: Map<string, Integer> = new Map();
    const nodes: Integer[] = [];

    // 1. Create bare type parameter nodes with names
    for (let i = 0; i < typeParameters.length; i++) {
        const typeParam = typeParameters[i];
        const typeParamNodeProps = {
            index: i,
            name: typeParam.name,
        };
        const id = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (typeParam:TS:TypeParameter $typeParamNodeProps)
            RETURN id(typeParam)
            `,
                {typeParamNodeProps: typeParamNodeProps}
            )
        );
        result.set(typeParam.name, id);
        nodes.push(id);
    }

    // 2. Create constraint types
    for (let i = 0; i < typeParameters.length; i++) {
        const typeParam = typeParameters[i];
        const typeParamId = nodes[i];

        if (!(typeParam.constraint.constructor.name === "LCETypeObject" && (typeParam.constraint as LCETypeObject).members.size === 0)) {
            await createTypeNode(
                typeParam.constraint,
                neo4jSession,
                connectionIndex,
                typeParamId,
                {name: ":CONSTRAINED_BY", props: {}},
                parentTypeParamNodes,
                result
            );
        }
    }

    return result;
}
