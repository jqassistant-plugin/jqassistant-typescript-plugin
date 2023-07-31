import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCEInterfaceDeclaration} from "../concepts/interface-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createClassLikeTypeParameterNodes, createMemberNodes} from "./class-like-declaration.generator.utils";
import {createTypeNode} from "./type.generator.utils";

/**
 * Generates all graph structures related to interface declarations.
 * This includes type parameters, properties, methods, along with their types.
 */
export class InterfaceDeclarationGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        const interfaceDecls = getAndCastConcepts<LCEInterfaceDeclaration>(LCEInterfaceDeclaration.conceptId, concepts);

        console.log("Generating graph structures for " + interfaceDecls.length + " interface declarations...");
        // create interface structures
        for (const interfaceDecl of interfaceDecls) {
            // create interface node
            const interfaceNodeProps = {
                fqn: interfaceDecl.fqn,
                name: interfaceDecl.interfaceName,
            };
            const interfaceNodeId = Utils.getNodeIdFromQueryResult(
                await neo4jSession.run(
                    `
                CREATE (interface:TS:Interface $interfaceProps) 
                RETURN id(interface)
                `,
                    {interfaceProps: interfaceNodeProps}
                )
            );
            connectionIndex.providerNodes.set(interfaceDecl.fqn, interfaceNodeId);

            // create type parameter nodes and connections
            const interfaceTypeParameters = await createClassLikeTypeParameterNodes(interfaceDecl, interfaceNodeId, neo4jSession, connectionIndex);

            // create type nodes for interfaces that are extended
            for (const extendsType of interfaceDecl.extendsInterfaces) {
                await createTypeNode(
                    extendsType,
                    neo4jSession,
                    connectionIndex,
                    interfaceNodeId,
                    {name: ":EXTENDS", props: {}},
                    interfaceTypeParameters
                );
            }

            // create property and method nodes and connections
            await createMemberNodes(interfaceDecl, interfaceNodeId, interfaceTypeParameters, neo4jSession, connectionIndex);

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
                    sourcePath: PathUtils.toGraphPath(interfaceDecl.sourceFilePath),
                    interfaceId: interfaceNodeId,
                }
            );
        }
    }
}
