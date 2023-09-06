import { PostProcessor } from "../post-processor";
import { LCEConcept } from "../concept";
import { LCEExportDeclaration } from "../concepts/export-declaration.concept";
import { LCEModule } from "../concepts/typescript-module.concept";
import { PathUtils } from "../utils/path.utils";
import { LCEExternalModule } from "../concepts/externals.concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { NodeUtils } from "../utils/node.utils";
import path from "path";
import * as fs from "fs";

export class ExportsPostProcessor extends PostProcessor {
    postProcess(concepts: Map<string, LCEConcept[]>, projectRootPath: string): void {
        const modules = (concepts.get(LCEModule.conceptId) ?? []) as LCEModule[];
        const externalModules = (concepts.get(LCEExternalModule.conceptId) ?? []) as LCEExternalModule[];
        const allExports = (concepts.get(LCEExportDeclaration.conceptId) ?? []) as LCEExportDeclaration[];
        const newExports: LCEExportDeclaration[] = [];

        for (const module of modules) {
            newExports.push(...this.getAllModuleExports(concepts, allExports, module.fqn, externalModules, projectRootPath));
        }

        concepts.set(LCEExportDeclaration.conceptId, newExports);
    }

    private getAllModuleExports(
        concepts: Map<string, LCEConcept[]>,
        exports: LCEExportDeclaration[],
        modulePath: string,
        externalModules: LCEExternalModule[],
        projectRootPath: string,
    ): LCEExportDeclaration[] {
        const result: LCEExportDeclaration[] = [];
        const stats = fs.statSync(path.resolve(projectRootPath, modulePath));
        if (stats.isDirectory()) {
            modulePath += "/index.ts";
        }
        const rawExports = this.filterExportsForModule(exports, modulePath);

        for (const exp of rawExports) {
            if (exp.importSource) {
                if (exp.sourceInProject) {
                    // internal re-export: try to resolve export tree
                    const moduleExports = this.getAllModuleExports(concepts, exports, exp.importSource, externalModules, projectRootPath);
                    if (exp.kind === "namespace") {
                        // namespace re-export: convert all namespace exports into individual export declarations
                        if (exp.declFqn) {
                            for (const moduleExport of moduleExports) {
                                let identifier = moduleExport.alias ?? moduleExport.identifier;
                                if (moduleExport.isDefault) {
                                    identifier = "default";
                                }
                                result.push(
                                    new LCEExportDeclaration(
                                        identifier,
                                        exp.alias ? `${exp.alias}.${identifier}` : undefined,
                                        moduleExport.declFqn,
                                        undefined,
                                        undefined,
                                        moduleExport.isDefault,
                                        moduleExport.kind,
                                        modulePath,
                                    ),
                                );
                            }
                            this.addDependency(concepts, modulePath, exp.importSource, "module");
                        }
                    } else {
                        // named re-export
                        let originalExport = this.findSingleModuleExport(moduleExports, exp.identifier);
                        if (originalExport) {
                            result.push(
                                new LCEExportDeclaration(
                                    exp.identifier,
                                    exp.alias,
                                    originalExport.declFqn,
                                    undefined,
                                    undefined,
                                    exp.isDefault,
                                    originalExport.kind,
                                    modulePath,
                                ),
                            );
                            if (originalExport.declFqn) {
                                this.addDependency(concepts, modulePath, originalExport.declFqn);
                            }
                        } else {
                            console.log(
                                `Error: could not find exported declaration "${exp.identifier}" in "${exp.importSource}": Ignoring export...`,
                            );
                        }
                    }
                } else {
                    // external re-export: link to external declaration(s)
                    let importSource = exp.importSource;
                    let externalImportModule = externalModules.find((em) => em.fqn === exp.importSource);
                    if (!externalImportModule) {
                        // if import source is a node module identifier try to resolve it
                        const resolvedModulePath = require.resolve(exp.importSource, { paths: [projectRootPath] }).replace(/\\/g, "/");
                        const packageName = NodeUtils.getPackageNameForPath(projectRootPath, resolvedModulePath);
                        if (packageName) {
                            externalImportModule = externalModules.find((em) => em.fqn === packageName);
                        }
                        if (!externalImportModule) {
                            importSource = PathUtils.normalize(projectRootPath, resolvedModulePath);
                            externalImportModule = externalModules.find((em) => em.fqn === importSource);
                        }
                        if (!externalImportModule) {
                            // TODO: refine this or find existing mechanism that solves the problem of .d.ts to .js mapping
                            const potentialDTSPath = resolvedModulePath.replace("node_modules/", "node_modules/@types/").replace(".js", ".d.ts");
                            importSource = PathUtils.normalize(projectRootPath, potentialDTSPath);
                            externalImportModule = externalModules.find((em) => em.fqn === importSource);
                        }
                    }
                    if (externalImportModule) {
                        const externalDeclarations = externalImportModule.declarations;
                        if (exp.kind === "namespace") {
                            // namespace re-export: export all known external declarations of external module
                            for (const eDecl of externalDeclarations) {
                                result.push(
                                    new LCEExportDeclaration(
                                        eDecl.name,
                                        exp.alias ? `${exp.alias}.${eDecl.name}` : undefined,
                                        eDecl.fqn,
                                        undefined,
                                        undefined,
                                        false, // technically incorrect, but not relevant for graph generation
                                        "value", //  - || -
                                        modulePath,
                                    ),
                                );
                            }
                            this.addDependency(concepts, modulePath, importSource, "module");
                        } else {
                            // named re-export of single external dependency
                            let eDecl = externalDeclarations.find((ed) => ed.name === exp.identifier);
                            if (!eDecl) {
                                // TODO: this solution can't handle multiple namespaces in the same file:  solve namespace problems
                                eDecl = externalDeclarations.find((ed) => ed.name.endsWith(`.${exp.identifier}`));
                            }
                            if (eDecl) {
                                result.push(
                                    new LCEExportDeclaration(
                                        eDecl.name,
                                        exp.alias,
                                        eDecl.fqn,
                                        undefined,
                                        undefined,
                                        exp.isDefault,
                                        exp.kind,
                                        modulePath,
                                    ),
                                );
                                this.addDependency(concepts, modulePath, eDecl.fqn);
                            } else {
                                console.log(
                                    `Error: external declaration with identifier "${exp.identifier}" in module "${exp.importSource}" could not be found: Ignoring export...`,
                                );
                            }
                        }
                    } else {
                        console.log(`Error: external module "${exp.importSource}" for re-export could not be found: Ignoring export...`);
                    }
                }
            } else {
                result.push(exp);
            }
        }

        return result;
    }

    private filterExportsForModule(exports: LCEExportDeclaration[], modulePath: string): LCEExportDeclaration[] {
        return exports.filter((ed) => ed.sourceFilePath === modulePath);
    }

    private findSingleModuleExport(moduleExports: LCEExportDeclaration[], name: string) {
        for (const me of moduleExports) {
            if (name === "default") {
                if (me.isDefault) {
                    return me;
                }
            } else {
                const meName = me.alias ?? me.identifier;
                if (meName === name) {
                    return me;
                }
            }
        }
    }

    private addDependency(concepts: Map<string, LCEConcept[]>, source: string, target: string, targetType: "declaration" | "module" = "declaration") {
        const dependencies = (concepts.get(LCEDependency.conceptId) ?? []) as LCEDependency[];
        dependencies.push(new LCEDependency(target, targetType, source, "module", 1));
        concepts.set(LCEDependency.conceptId, dependencies);
    }
}
