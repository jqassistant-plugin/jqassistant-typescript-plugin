import {Session} from "neo4j-driver";

import {Generator} from "../../core/generator";

/**
 * Marks all nodes declaring a React component.
 */
export class ReactComponentGenerator extends Generator {
    async run(neo4jSession: Session): Promise<void> {
        console.log("Generating graph structures for React components...");

        // Function Components
        await neo4jSession.run(`
            MATCH (c:TS:Variable)-[:OF_TYPE]->(:TS:Type:Declared {referencedFqn:'"React".FC'}) 
            SET c:React:ReactComponent:FunctionComponent
        `);

        await neo4jSession.run(`
            MATCH (c:TS:Variable)-[:OF_TYPE]->(:TS:Type:Function)-[:RETURNS]->(:TS:Type:Declared {referencedFqn:'"global.JSX".Element'}) 
            SET c:React:ReactComponent:FunctionComponent
        `);

        // Higher-Order Components
        await neo4jSession.run(`
            MATCH (c:TS:Variable)-[:OF_TYPE]->(:TS:Type:Function)-[:RETURNS]->(:TS:Type:Function)-[:RETURNS]->(:TS:Type:Declared {referencedFqn:'"global.JSX".Element'}) 
            SET c:React:ReactComponent:HigherOrderComponent
        `);

        // Class Components
        await neo4jSession.run(`
            MATCH (c:TS:Class)-[:EXTENDS]->(:TS:Type:Declared {referencedFqn:'"React".Component'}) 
            SET c:React:ReactComponent:ClassComponent
        `);
    }
}
