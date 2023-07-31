import {Integer, Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCEDependency} from "../concepts/dependency.concept";
import {LCEExportDeclaration} from "../concepts/export-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {Generator} from "../generator";
import {PathUtils} from "../path.utils";
import {Utils} from "../utils";

/**
 * Generates all graph structures related to dependencies between files in the form of imports and exports.
 */
export class DependencyGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        // Create export relations
        const exports: LCEExportDeclaration[] = getAndCastConcepts(LCEExportDeclaration.conceptId, concepts);
        console.log("Generating graph structures for " + exports.length + " exports...");

        for (const ex of exports) {
            if (ex.kind === "namespace" || ex.importSource !== undefined) {
                // TODO: implement re-exports
            } else {
                if (!ex.declFqn) throw new Error("Exported declaration has no specified declaration FQN!");
                const relationAttrs = {
                    exportedName: ex.alias ?? ex.identifier,
                };
                await neo4jSession.run(
                    `
                    MATCH (file:TS:Module {fileName: $sourcePath})
                    MATCH (decl:TS {fqn: $fqn})
                    CREATE (file)-[:EXPORTS $relationAttrs]->(decl)
                    RETURN file
                    `,
                    {
                        sourcePath: PathUtils.toGraphPath(ex.sourceFilePath),
                        fqn: ex.declFqn,
                        relationAttrs,
                    }
                );
            }
        }

        // create dependency structures
        const dependencies: LCEDependency[] = getAndCastConcepts(LCEDependency.conceptId, concepts);
        console.log("Generating graph structures for " + dependencies.length + " direct dependencies...");
        const externalModules = new Map<string, Integer>();
        const externalDeclarations = new Map<string, Integer>();
        for (const dep of dependencies) {
            const external = PathUtils.isExternal(dep.targetType === "module" ? dep.fqn : PathUtils.extractFQNPath(dep.fqn));
            // Create external module/declaration nodes if needed
            if (external) {
                if (dep.targetType === "declaration") {
                    const modulePath = PathUtils.extractFQNPath(dep.fqn);
                    if (!externalModules.has(modulePath)) {
                        const moduleId = Utils.getNodeIdFromQueryResult(
                            await neo4jSession.run(
                                `
                                CREATE (mod:TS:Module:External $modProps)
                                RETURN id(mod)
                                `,
                                {modProps: {fileName: modulePath}}
                            )
                        );
                        externalModules.set(modulePath, moduleId);
                        connectionIndex.providerNodes.set(dep.fqn, moduleId);
                    }
                    if (!externalDeclarations.has(dep.fqn)) {
                        const extDepId = Utils.getNodeIdFromQueryResult(
                            await neo4jSession.run(
                                `
                                MATCH (mod:TS)
                                WHERE id(mod) = $modId
                                CREATE (mod)-[:DECLARES]->(decl:TS:ExternalDeclaration $declProps)
                                RETURN id(decl)
                                `,
                                {
                                    modId: externalModules.get(modulePath),
                                    declProps: {
                                        fqn: dep.fqn,
                                        name: PathUtils.extractFQNIdentifier(dep.fqn),
                                    },
                                }
                            )
                        );
                        externalDeclarations.set(dep.fqn, extDepId);
                        connectionIndex.providerNodes.set(dep.fqn, extDepId);
                    }
                } else if (!externalModules.has(dep.fqn)) {
                    externalModules.set(
                        dep.fqn,
                        Utils.getNodeIdFromQueryResult(
                            await neo4jSession.run(
                                `
                        CREATE (mod:TS:ExternalModule $modProps)
                        RETURN id(mod)
                        `,
                                {
                                    modProps: {fileName: dep.fqn},
                                }
                            )
                        )
                    );
                }
            }

            // Create depends-on relation
            const options = {
                source: dep.sourceType === "module" ? PathUtils.toGraphPath(PathUtils.extractFQNPath(dep.sourceFQN)) : dep.sourceFQN,
                target: dep.targetType === "module" && !external ? PathUtils.toGraphPath(dep.fqn) : dep.fqn,
                depProps: {
                    cardinality: dep.cardinality,
                },
            };
            const srcMatch = dep.sourceType === "declaration" ? "MATCH (src:TS {fqn: $source})\n" : "MATCH (src:TS {fileName: $source})\n";
            const trgtMatch = dep.targetType === "declaration" ? "MATCH (trgt:TS {fqn: $target})\n" : "MATCH (trgt:TS {fileName: $target})\n";
            await neo4jSession.run(
                srcMatch +
                trgtMatch +
                `
                WHERE NOT (trgt)-[:DECLARES*]->(src)
                CREATE (src)-[:DEPENDS_ON $depProps]->(trgt)
                `,
                options
            );
        }

        // create missing transitive relations
        await neo4jSession.run(
            `
            MATCH (decl:TS)-[r:DEPENDS_ON]->(trgt:TS)<-[:DECLARES*]-(trgtParent:TS)
            WHERE NOT (trgtParent)-[:DECLARES*]->(decl)
            CREATE (decl)-[:DEPENDS_ON {cardinality: r.cardinality}]->(trgtParent)
            `
        );
        await neo4jSession.run(
            `
            MATCH (srcParent:TS)-[:DECLARES*]->(decl:TS)-[r:DEPENDS_ON]->(trgt:TS)
            WHERE NOT (srcParent)-[:DECLARES*]->(trgt)
            CREATE (srcParent)-[:DEPENDS_ON {cardinality: r.cardinality}]->(trgt)
            `
        );

        // aggregate relations
        // solution from https://stackoverflow.com/questions/37097177/neo4j-duplicate-relationship
        await neo4jSession.run(
            `
            MATCH (src:TS)-[r:DEPENDS_ON]->(trgt:TS)

            // aggregate the relationships and limit it to those with more than 1
            WITH src, trgt, collect(r) AS rels, sum(r.cardinality) AS new_cardinality
            WHERE size(rels) > 1

            // update the first relationship with the new total cardinality
            SET (rels[0]).cardinality = new_cardinality

            // bring the aggregated data forward
            WITH src, trgt, rels, new_cardinality

            // delete the relationships 1..n
            UNWIND range(1,size(rels)-1) AS idx
            DELETE rels[idx]
            `
        );
    }
}
