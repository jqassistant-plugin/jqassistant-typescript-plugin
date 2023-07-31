import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCEVariableDeclaration} from "../concepts/variable-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createTypeNode} from "./type.generator.utils";
import {createValueNode} from "./value.generator.utils";

/**
 * Generates all graph structures related to variable declarations on file level.
 */
export class VariableDeclarationGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        const varDecls = getAndCastConcepts<LCEVariableDeclaration>(LCEVariableDeclaration.conceptId, concepts);

        console.log("Generating graph structures for " + varDecls.length + " variable declarations...");
        // create variable declaration structures
        for (const varDecl of varDecls) {
            // create variable declaration node
            const varNodeProps = {
                fqn: varDecl.fqn,
                name: varDecl.variableName,
                kind: varDecl.kind,
            };
            const varNodeId = Utils.getNodeIdFromQueryResult(
                await neo4jSession.run(
                    `
                CREATE (var:TS:Variable $varNodeProps) 
                RETURN id(var)
                `,
                    {varNodeProps}
                )
            );
            connectionIndex.providerNodes.set(varDecl.fqn, varNodeId);

            // create nodes for variable type
            await createTypeNode(varDecl.type, neo4jSession, connectionIndex, varNodeId, {name: ":OF_TYPE", props: {}});

            // create nodes for initial value
            if (varDecl.initValue) {
                await createValueNode(varDecl.initValue, neo4jSession, connectionIndex, varNodeId, {
                    name: ":INITIALIZED_WITH",
                    props: {}
                });
            }

            // link variable declaration to source file
            await neo4jSession.run(
                `
                MATCH (var)
                MATCH (file:TS:Module {fileName: $sourcePath})
                WHERE id(var) = $varNodeId
                CREATE (file)-[:DECLARES]->(var)
                RETURN var
                `,
                {
                    sourcePath: PathUtils.toGraphPath(varDecl.sourceFilePath),
                    varNodeId,
                }
            );
        }
    }
}
