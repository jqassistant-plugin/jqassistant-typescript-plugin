import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCEFunctionDeclaration} from "../concepts/function-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createFunctionParameterNodes} from "./function.generator.utils";
import {createTypeNode, createTypeParameterNodes} from "./type.generator.utils";

/**
 * Generates all graph structures related to function declarations on file level.
 * This includes type parameters, return type and parameters.
 */
export class FunctionDeclarationGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        const functionDecls = getAndCastConcepts<LCEFunctionDeclaration>(LCEFunctionDeclaration.conceptId, concepts);

        console.log("Generating graph structures for " + functionDecls.length + " function declarations...");
        // create function structures
        for (const funcDecl of functionDecls) {
            // create function node
            const funcNodeProps = {
                fqn: funcDecl.fqn,
                name: funcDecl.functionName,
            };
            const funcNodeId = Utils.getNodeIdFromQueryResult(
                await neo4jSession.run(
                    `
                CREATE (func:TS:Function $funcNodeProps) 
                RETURN id(func)
                `,
                    {funcNodeProps: funcNodeProps}
                )
            );
            connectionIndex.providerNodes.set(funcDecl.fqn, funcNodeId);

            // create type parameter nodes and connections
            const funcTypeParameters = await createTypeParameterNodes(funcDecl.typeParameters, neo4jSession, connectionIndex);
            for (const typeParamNodeId of funcTypeParameters.values()) {
                connectionIndex.connectionsToCreate.push([funcNodeId, typeParamNodeId, {name: ":DECLARES", props: {}}]);
            }

            // create return type node and connections;
            await createTypeNode(funcDecl.returnType, neo4jSession, connectionIndex, funcNodeId, {
                name: ":RETURNS",
                props: {}
            }, funcTypeParameters);

            await createFunctionParameterNodes(funcNodeId, neo4jSession, funcDecl.parameters, connectionIndex, funcTypeParameters);

            // link interface declaration to source file
            await neo4jSession.run(
                `
                MATCH (interface)
                MATCH (file:TS:Module {fileName: $sourcePath})
                WHERE id(interface) = $interfaceId
                CREATE (file)-[:DECLARES]->(interface)
                RETURN interface
                `,
                {
                    sourcePath: PathUtils.toGraphPath(funcDecl.sourceFilePath),
                    interfaceId: funcNodeId,
                }
            );
        }
    }
}
