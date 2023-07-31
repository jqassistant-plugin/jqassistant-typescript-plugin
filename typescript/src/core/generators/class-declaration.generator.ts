import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCEClassDeclaration} from "../concepts/class-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";
import {createClassLikeTypeParameterNodes, createMemberNodes} from "./class-like-declaration.generator.utils";
import {createDecoratorNode} from "./decorator.generator.utils";
import {createTypeNode} from "./type.generator.utils";

/**
 * Generates all graph structures related to class declarations.
 * This includes type parameters, properties, methods, along with their types.
 */
export class ClassDeclarationGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        const classDecls: LCEClassDeclaration[] = getAndCastConcepts(LCEClassDeclaration.conceptId, concepts);

        console.log("Generating graph structures for " + classDecls.length + " class declarations...");
        // create class structures
        for (const classDecl of classDecls) {
            // create class node
            const classNodeProps = {
                fqn: classDecl.fqn,
                name: classDecl.className,
                abstract: classDecl.abstract,
            };
            const classNodeId = Utils.getNodeIdFromQueryResult(
                await neo4jSession.run(
                    `
                CREATE (class:TS:Class $classProps) 
                RETURN id(class)
                `,
                    {classProps: classNodeProps}
                )
            );
            connectionIndex.providerNodes.set(classDecl.fqn, classNodeId);

            // create class decorator nodes and connections
            for (const deco of classDecl.decorators) {
                await createDecoratorNode(deco, neo4jSession, connectionIndex, classNodeId, {
                    name: ":DECORATED_BY",
                    props: {}
                });
            }

            // create type parameter nodes and connections
            const classTypeParameters = await createClassLikeTypeParameterNodes(classDecl, classNodeId, neo4jSession, connectionIndex);

            // create type node for super class, if class has one
            if (classDecl.extendsClass) {
                await createTypeNode(
                    classDecl.extendsClass,
                    neo4jSession,
                    connectionIndex,
                    classNodeId,
                    {name: ":EXTENDS", props: {}},
                    classTypeParameters
                );
            }

            // create type nodes for interfaces that are implemented
            for (const implType of classDecl.implementsInterfaces) {
                await createTypeNode(implType, neo4jSession, connectionIndex, classNodeId, {
                    name: ":IMPLEMENTS",
                    props: {}
                }, classTypeParameters);
            }

            // create property and method nodes and connections
            await createMemberNodes(classDecl, classNodeId, classTypeParameters, neo4jSession, connectionIndex);

            // link class declaration to source file
            await neo4jSession.run(
                `
                MATCH (class)
                MATCH (file:TS:Module {fileName: $sourcePath})
                WHERE id(class) = $classId
                CREATE (file)-[:DECLARES]->(class)
                RETURN class
                `,
                {
                    sourcePath: PathUtils.toGraphPath(classDecl.sourceFilePath),
                    classId: classNodeId,
                }
            );
        }
    }
}
