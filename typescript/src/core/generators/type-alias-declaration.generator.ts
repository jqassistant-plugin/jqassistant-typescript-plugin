import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCETypeAliasDeclaration} from "../concepts/type-alias-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createClassLikeTypeParameterNodes} from "./class-like-declaration.generator.utils";
import {createTypeNode} from "./type.generator.utils";

/**
 * Generates all graph structures related to type alias declarations.
 * This includes potential type parameters and the type described by the alias.
 */
export class TypeAliasDeclarationGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        const typeAliasDecls = getAndCastConcepts<LCETypeAliasDeclaration>(LCETypeAliasDeclaration.conceptId, concepts);

        console.log("Generating graph structures for " + typeAliasDecls.length + " type alias declarations...");
        // create type alias structures
        for (const typeAliasDecl of typeAliasDecls) {
            // create type alias node
            const typeAliasNodeProps = {
                fqn: typeAliasDecl.fqn,
                name: typeAliasDecl.typeAliasName,
            };
            const typeAliasNodeId = Utils.getNodeIdFromQueryResult(
                await neo4jSession.run(
                    `
                CREATE (ta:TS:TypeAlias $typeAliasNodeProps) 
                RETURN id(ta)
                `,
                    {typeAliasNodeProps}
                )
            );
            connectionIndex.providerNodes.set(typeAliasDecl.fqn, typeAliasNodeId);

            // create type parameter nodes and connections
            const interfaceTypeParameters = await createClassLikeTypeParameterNodes(typeAliasDecl, typeAliasNodeId, neo4jSession, connectionIndex);

            // create type nodes for the type described by the alias
            await createTypeNode(
                typeAliasDecl.type,
                neo4jSession,
                connectionIndex,
                typeAliasNodeId,
                {name: ":OF_TYPE", props: {}},
                interfaceTypeParameters
            );

            // link interface declaration to source file
            await neo4jSession.run(
                `
                MATCH (ta)
                MATCH (file:TS:Module {fileName: $sourcePath})
                WHERE id(ta) = $typeAliasNodeId
                CREATE (file)-[:DECLARES]->(ta)
                RETURN ta
                `,
                {
                    sourcePath: PathUtils.toGraphPath(typeAliasDecl.sourceFilePath),
                    typeAliasNodeId,
                }
            );
        }
    }
}
