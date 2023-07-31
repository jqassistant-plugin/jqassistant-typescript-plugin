import {Integer, Session} from "neo4j-driver";

import {LCEPropertyDeclaration} from "../concepts/property-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Utils} from "../utils";
import {createDecoratorNode} from "./decorator.generator.utils";
import {createTypeNode} from "./type.generator.utils";

export async function createPropertyNode(
    propertyDecl: LCEPropertyDeclaration,
    neo4jSession: Session,
    connectionIndex: ConnectionIndex,
    parentTypeParamNodes: Map<string, Integer> = new Map()
): Promise<Integer> {
    // create property node
    const propertyNodeProps = {
        name: propertyDecl.propertyName,
        fqn: propertyDecl.fqn,
        optional: propertyDecl.optional,
        visibility: propertyDecl.visibility,
        readonly: propertyDecl.readonly,
        override: propertyDecl.override,
        abstract: propertyDecl.abstract,
        static: propertyDecl.isStatic,
    };
    const propNodeId = Utils.getNodeIdFromQueryResult(
        await neo4jSession.run(
            `
        CREATE (property:TS:Property $propertyNodeProps)
        RETURN id(property)
        `,
            {propertyNodeProps: propertyNodeProps}
        )
    );

    // create property decorator nodes and connections
    for (const deco of propertyDecl.decorators) {
        await createDecoratorNode(deco, neo4jSession, connectionIndex, propNodeId, {
            name: ":DECORATED_BY",
            props: {},
        });
    }

    // create property type nodes
    await createTypeNode(
        propertyDecl.type,
        neo4jSession,
        connectionIndex,
        propNodeId,
        {name: ":OF_TYPE", props: {}},
        parentTypeParamNodes
    );

    return propNodeId;
}
