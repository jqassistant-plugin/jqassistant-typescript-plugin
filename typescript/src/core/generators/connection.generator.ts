import {Session} from "neo4j-driver";

import {LCEConcept} from "../concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";

export class ConnectionGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        connectionIndex.resolve();

        console.log(" - Generating " + connectionIndex.connectionsToCreate.length + " outstanding connections...");

        for (const [from, to, props] of connectionIndex.connectionsToCreate) {
            await neo4jSession.run(
                `
                MATCH (from)
                MATCH (to)
                WHERE id(from) = $fromId AND id(to) = $toId
                CREATE (from)-[` +
                props.name +
                ` $props]->(to)
                RETURN to
            `,
                {props: props.props, fromId: from, toId: to}
            );
        }
        connectionIndex.connectionsToCreate = [];
    }
}
