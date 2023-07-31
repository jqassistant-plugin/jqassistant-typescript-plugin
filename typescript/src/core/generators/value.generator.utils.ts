import {Integer, Session} from "neo4j-driver";

import {
    LCEValue,
    LCEValueArray,
    LCEValueCall,
    LCEValueClass,
    LCEValueComplex,
    LCEValueDeclared,
    LCEValueFunction,
    LCEValueLiteral,
    LCEValueMember,
    LCEValueNull,
    LCEValueObject,
} from "../concepts/value.concept";
import {ConnectionIndex, ConnectionProperties} from "../connection-index";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createTypeNode} from "./type.generator.utils";

/**
 * Recursively creates value nodes for given `LCEValue` and registers connection information within the `ConnectionIndex`.
 * @param value `LCEValue` for which nodes are created
 * @param connectionIndex index for registering connections to values (for later creation)
 * @param parentNode node which will be related to the value node
 * @param connectionProps properties of connection that will be registered from parent to value node
 */
export async function createValueNode(
    value: LCEValue,
    neo4jSession: Session,
    connectionIndex: ConnectionIndex,
    parentNode: Integer,
    connectionProps: ConnectionProperties
): Promise<Integer | undefined> {
    // NOTE: every newly created value node must be registered at the connectionIndex for a connection

    let valueNodeId: Integer | undefined;

    if (value instanceof LCEValueNull) {
        const valueNodeProps = {
            kind: value.kind,
        };
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Null $valueNodeProps)
            RETURN id(val)
            `,
                {valueNodeProps}
            )
        );
    } else if (value instanceof LCEValueLiteral) {
        const valueNodeProps = {
            value: value.value instanceof RegExp ? value.value.source : value.value,
        };
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Literal $valueNodeProps)
            RETURN id(val)
            `,
                {valueNodeProps}
            )
        );
    } else if (value instanceof LCEValueDeclared) {
        if (value.fqn === '"./src/a.ts".vNumber')
            value
        const valueNodeProps = {
            referencedFqn: value.fqn,
            internal: !PathUtils.isExternal(PathUtils.extractFQNPath(value.fqn)),
        };
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Declared $valueNodeProps)
            RETURN id(val)
            `,
                {valueNodeProps}
            )
        );
        connectionIndex.referenceNodes.set(valueNodeId, [value.fqn, {name: ":REFERENCES", props: {}}]);
    } else if (value instanceof LCEValueMember) {
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Member)
            RETURN id(val)
            `
            )
        );
        await createValueNode(value.parent, neo4jSession, connectionIndex, valueNodeId, {name: ":PARENT", props: {}});
        await createValueNode(value.member, neo4jSession, connectionIndex, valueNodeId, {name: ":MEMBER", props: {}});
    } else if (value instanceof LCEValueObject) {
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Object)
            RETURN id(val)
            `
            )
        );
        for (const [key, member] of value.members.entries()) {
            await createValueNode(member, neo4jSession, connectionIndex, valueNodeId, {
                name: ":HAS_MEMBER",
                props: {name: key}
            });
        }
    } else if (value instanceof LCEValueArray) {
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Array)
            RETURN id(val)
            `
            )
        );
        for (let i = 0; i < value.items.length; i++) {
            const item = value.items[i];
            await createValueNode(item, neo4jSession, connectionIndex, valueNodeId, {
                name: ":CONTAINS",
                props: {index: i},
            });
        }
    } else if (value instanceof LCEValueCall) {
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Call)
            RETURN id(val)
            `
            )
        );
        await createValueNode(value.callee, neo4jSession, connectionIndex, valueNodeId, {name: ":CALLS", props: {}});
        for (let i = 0; i < value.args.length; i++) {
            const arg = value.args[i];
            await createValueNode(arg, neo4jSession, connectionIndex, valueNodeId, {
                name: ":HAS_ARGUMENT",
                props: {index: i},
            });
        }
        for (let i = 0; i < value.typeArgs.length; i++) {
            const typeArg = value.typeArgs[i];
            await createTypeNode(typeArg, neo4jSession, connectionIndex, valueNodeId, {
                name: ":HAS_TYPE_ARGUMENT",
                props: {index: i}
            });
        }
    } else if (value instanceof LCEValueFunction) {
        const valueNodeProps = {
            arrowFunction: value.arrowFunction,
        };
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Function $valueNodeProps)
            RETURN id(val)
            `,
                {valueNodeProps}
            )
        );
    } else if (value instanceof LCEValueClass) {
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Class)
            RETURN id(val)
            `
            )
        );
    } else if (value instanceof LCEValueComplex) {
        const valueNodeProps = {
            expression: value.expression,
        };
        valueNodeId = Utils.getNodeIdFromQueryResult(
            await neo4jSession.run(
                `
            CREATE (val:TS:Value:Complex $valueNodeProps)
            RETURN id(val)
            `,
                {valueNodeProps}
            )
        );
    }

    if (valueNodeId) {
        // conncect to parent node
        connectionIndex.connectionsToCreate.push([parentNode, valueNodeId, connectionProps]);

        // create type node (skip object values to reduce redundancy)
        if (!(value instanceof LCEValueObject)) {
            await createTypeNode(value.type, neo4jSession, connectionIndex, valueNodeId, {name: ":OF_TYPE", props: {}});
        }
    }

    return valueNodeId;
}
