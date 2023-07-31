import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCEEnumDeclaration} from "../concepts/enum-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createValueNode} from "./value.generator.utils";

/**
 * Generates all graph structures related to enum declarations on file level.
 */
export class EnumDeclarationGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        const enumDecls = getAndCastConcepts<LCEEnumDeclaration>(LCEEnumDeclaration.conceptId, concepts);

        console.log("Generating graph structures for " + enumDecls.length + " enum declarations...");
        // create enum declaration structures
        for (const enumDecl of enumDecls) {
            // create enum declaration node
            const enumNodeProps = {
                fqn: enumDecl.fqn,
                name: enumDecl.enumName,
                const: enumDecl.constant,
                declared: enumDecl.declared,
            };
            const enumNodeId = Utils.getNodeIdFromQueryResult(
                await neo4jSession.run(
                    `
                CREATE (enum:TS:Enum $enumNodeProps) 
                RETURN id(enum)
                `,
                    {enumNodeProps}
                )
            );
            connectionIndex.providerNodes.set(enumDecl.fqn, enumNodeId);

            // create enum member structures
            for (let i = 0; i < enumDecl.members.length; i++) {
                const enumMemberDecl = enumDecl.members[i];

                // create enum member node
                const enumMemberNodeProps = {
                    fqn: enumMemberDecl.fqn,
                    name: enumMemberDecl.enumMemberName,
                };
                const enumMemberNodeId = Utils.getNodeIdFromQueryResult(
                    await neo4jSession.run(
                        `
                    CREATE (enumMember:TS:EnumMember $enumMemberNodeProps) 
                    RETURN id(enumMember)
                    `,
                        {enumMemberNodeProps}
                    )
                );
                connectionIndex.providerNodes.set(enumMemberDecl.fqn, enumMemberNodeId);

                // create nodes for initial value
                if (enumMemberDecl.init) {
                    await createValueNode(enumMemberDecl.init, neo4jSession, connectionIndex, enumMemberNodeId, {
                        name: ":INITIALIZED_WITH",
                        props: {},
                    });
                }

                // link enum member to enum declaration
                connectionIndex.connectionsToCreate.push([enumNodeId, enumMemberNodeId, {
                    name: ":DECLARES",
                    props: {index: i}
                }]);
            }

            // link enum declaration to source file
            await neo4jSession.run(
                `
                MATCH (enum)
                MATCH (file:TS:Module {fileName: $sourcePath})
                WHERE id(enum) = $enumNodeId
                CREATE (file)-[:DECLARES]->(enum)
                RETURN enum
                `,
                {
                    sourcePath: PathUtils.toGraphPath(enumDecl.sourceFilePath),
                    enumNodeId,
                }
            );
        }
    }
}
