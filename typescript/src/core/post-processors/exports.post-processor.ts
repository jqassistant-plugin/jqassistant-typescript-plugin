import { PostProcessor } from "../post-processor";
import { LCEExportDeclaration } from "../concepts/export-declaration.concept";
import { LCEModule } from "../concepts/typescript-module.concept";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { LCEExternalModule } from "../concepts/externals.concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { NodeUtils } from "../utils/node.utils";
import * as fs from "fs";
import { LCEProject, LCEProjectInfo } from "../project";
import {debug} from "../utils/log.utils";

export class ExportsPostProcessor extends PostProcessor {
    postProcess(projects: LCEProject[]): void {
        for (const project of projects) {
            const concepts = project.concepts;
            const modules = (concepts.get(LCEModule.conceptId) ?? []) as LCEModule[];
            const externalModules = (concepts.get(LCEExternalModule.conceptId) ?? []) as LCEExternalModule[];
            const allExports = (concepts.get(LCEExportDeclaration.conceptId) ?? []) as LCEExportDeclaration[];
            const newExports: LCEExportDeclaration[] = [];
            const newDependencies: Map<string, LCEDependency> = new Map();

            for (const module of modules) {
                newExports.push(
                    ...this.getAllModuleExports(newDependencies, allExports, module.fqn.globalFqn, externalModules, project.projectInfo, projects),
                );
            }

            concepts.set(LCEExportDeclaration.conceptId, newExports);
            if (newDependencies.size > 0) {
                concepts.set(LCEDependency.conceptId, [...(concepts.get(LCEDependency.conceptId) ?? []), ...newDependencies.values()]);
            }
        }
    }

    private getAllModuleExports(
        dependencies: Map<string, LCEDependency>,
        exports: LCEExportDeclaration[],
        modulePathAbsolute: string,
        externalModules: LCEExternalModule[],
        projectInfo: LCEProjectInfo,
        projects: LCEProject[],
        addDependencies = true,
    ): LCEExportDeclaration[] {
        const result: LCEExportDeclaration[] = [];

        const stats = fs.statSync(modulePathAbsolute);
        if (stats.isDirectory()) {
            if (fs.existsSync(modulePathAbsolute + "/index.ts")) {
                modulePathAbsolute += "/index.ts";
            } else if (fs.existsSync(modulePathAbsolute + "/index.tsx")) {
                modulePathAbsolute += "/index.tsx";
            } else if (fs.existsSync(modulePathAbsolute + "/index.mts")) {
                modulePathAbsolute += "/index.mts";
            }
        }
        const rawExports = this.filterExportsForModule(exports, modulePathAbsolute);

        for (const exp of rawExports) {
            if (exp.importSource) {
                // re-export
                if (!ModulePathUtils.isExternal(exp.importSource, projectInfo, projects)) {
                    // internal re-export: try to resolve export tree
                    // (the dependencies of the re-exported module are added when its own exports are resolved)
                    const moduleExports = this.getAllModuleExports(
                        dependencies,
                        exports,
                        exp.importSource,
                        externalModules,
                        projectInfo,
                        projects,
                        false,
                    );
                    if (exp.kind === "namespace") {
                        // namespace re-export: convert all namespace exports into individual export declarations
                        if (exp.globalDeclFqn) {
                            for (const moduleExport of moduleExports) {
                                let identifier = moduleExport.alias ?? moduleExport.identifier;
                                if (moduleExport.isDefault) {
                                    identifier = "default";
                                }
                                result.push(
                                    new LCEExportDeclaration(
                                        identifier,
                                        exp.alias ? `${exp.alias}.${identifier}` : undefined,
                                        moduleExport.globalDeclFqn,
                                        undefined,
                                        moduleExport.isDefault,
                                        moduleExport.kind,
                                        modulePathAbsolute,
                                    ),
                                );
                            }
                            if (addDependencies) this.addDependency(dependencies, modulePathAbsolute, exp.importSource, "module");
                        }
                    } else {
                        // named re-export
                        let originalExport = this.findSingleModuleExport(moduleExports, exp.identifier);
                        if (originalExport) {
                            result.push(
                                new LCEExportDeclaration(
                                    exp.identifier,
                                    exp.alias,
                                    originalExport.globalDeclFqn,
                                    undefined,
                                    exp.isDefault,
                                    originalExport.kind,
                                    modulePathAbsolute,
                                ),
                            );
                            if (originalExport.globalDeclFqn) {
                                if (addDependencies) this.addDependency(dependencies, modulePathAbsolute, originalExport.globalDeclFqn);
                            }
                        } else {
                            debug(
                                `Error: could not find exported declaration "${exp.identifier}" in "${exp.importSource}": Ignoring export...\n\toccurred at ${exp.sourceFilePathAbsolute}}`,
                            );
                        }
                    }
                } else {
                    // external re-export: link to external declaration(s)
                    let importSource = exp.importSource;
                    let externalImportModule = externalModules.find((em) => em.fqn.globalFqn === exp.importSource);
                    if (!externalImportModule) {
                        // if import source is a node module identifier try to resolve it
                        let resolvedModulePath;
                        try {
                            resolvedModulePath = NodeUtils.resolveImportPath(exp.importSource, projectInfo, exp.sourceFilePathAbsolute);
                        } catch (e) {
                            debug(`Error: Could not resolve module: ${exp.importSource}\n\toccurred at ${exp.sourceFilePathAbsolute}}`);
                        }

                        if (resolvedModulePath) {
                            const packageName = NodeUtils.getPackageNameForPath(projectInfo.rootPath, resolvedModulePath);
                            if (packageName) {
                                externalImportModule = externalModules.find((em) => em.fqn.globalFqn === packageName);
                            }
                            if (!externalImportModule) {
                                importSource = ModulePathUtils.normalize(projectInfo.rootPath, resolvedModulePath);
                                externalImportModule = externalModules.find((em) => em.fqn.globalFqn === importSource);
                            }
                            if (!externalImportModule) {
                                // TODO: refine this or find existing mechanism that solves the problem of .d.ts to .js mapping
                                const potentialDTSPath = resolvedModulePath.replace("node_modules/", "node_modules/@types/").replace(".js", ".d.ts");
                                importSource = ModulePathUtils.normalize(projectInfo.rootPath, potentialDTSPath);
                                externalImportModule = externalModules.find((em) => em.fqn.globalFqn === importSource);
                            }
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
                                        eDecl.fqn.globalFqn,
                                        undefined,
                                        false, // technically incorrect, but not relevant for graph generation
                                        "value", //  - || -
                                        modulePathAbsolute,
                                    ),
                                );
                            }
                            if (addDependencies) this.addDependency(dependencies, modulePathAbsolute, importSource, "module");
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
                                        eDecl.fqn.globalFqn,
                                        undefined,
                                        exp.isDefault,
                                        exp.kind,
                                        modulePathAbsolute,
                                    ),
                                );
                                if (addDependencies) this.addDependency(dependencies, modulePathAbsolute, eDecl.fqn.globalFqn);
                            } else {
                                debug(
                                    `Error: external declaration with identifier "${exp.identifier}" in module "${exp.importSource}" could not be found: Ignoring export...`,
                                );
                            }
                        }
                    } else {
                        debug(
                            `Error: external module "${exp.importSource}" for re-export of "${exp.identifier}" could not be found. Ignoring export...\n\toccurred at ${exp.sourceFilePathAbsolute}`,
                        );
                    }
                }
            } else {
                result.push(exp);
            }
        }

        return result;
    }

    private filterExportsForModule(exports: LCEExportDeclaration[], modulePath: string): LCEExportDeclaration[] {
        return exports.filter((ed) => ed.sourceFilePathAbsolute === modulePath);
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

    private addDependency(
        dependencies: Map<string, LCEDependency>,
        source: string,
        target: string,
        targetType: "declaration" | "module" = "declaration",
    ) {
        const key = JSON.stringify([source, target, targetType]);
        const existingDependency = dependencies.get(key);
        if (existingDependency) {
            existingDependency.cardinality++;
        } else {
            dependencies.set(key, new LCEDependency(target, targetType, source, "module", 1));
        }
    }
}
