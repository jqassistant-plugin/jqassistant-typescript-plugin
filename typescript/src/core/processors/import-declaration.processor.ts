import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { FQN, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { Processor } from "../processor";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { NodeUtils } from "../utils/node.utils";
import path from "path";

export class ImportDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ImportDeclaration], () => true);

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext): ConceptMap {
        // TODO: resolve complex import paths, e.g. https://stackoverflow.com/questions/42749973/what-does-the-mean-inside-an-import-path
        // TODO: resolve internal node packages to paths
        const concepts: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ImportDeclaration) {
            const importSource = ModulePathUtils.normalizeImportPath(
                globalContext.projectInfo.rootPath,
                node.source.value,
                globalContext.sourceFilePathRelative,
            );
            for (const specifier of node.specifiers) {
                let target = new FQN("");
                let isModule = false;
                if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
                    const importSourceFqn = ModulePathUtils.toFQN(importSource);
                    const importedName = specifier.imported.type === AST_NODE_TYPES.Identifier ? specifier.imported.name : specifier.imported.raw;
                    target = new FQN(importSourceFqn.globalFqn + "." + importedName, importSourceFqn.localFqn + "." + importedName);
                } else if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
                    const importSourceFqn = ModulePathUtils.toFQN(importSource);
                    target = new FQN(importSourceFqn.globalFqn + ".default", importSourceFqn.localFqn + ".default");
                } else if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
                    target = new FQN(path.resolve(globalContext.projectInfo.rootPath, importSource), importSource);
                    isModule = true;
                }

                if (!isModule && ModulePathUtils.getPathType(ModulePathUtils.extractFQNPath(target.globalFqn)) === "node") {
                    // resolve node package names to the appropriate paths
                    try {
                        const resolvedModulePath = NodeUtils.resolveImportPath(
                            ModulePathUtils.extractFQNPath(target.globalFqn),
                            globalContext.projectInfo,
                            globalContext.sourceFilePathAbsolute,
                        );
                        const targetDeclName = ModulePathUtils.extractFQNIdentifier(target.globalFqn);

                        let packageName: string | undefined = undefined;
                        if(resolvedModulePath.startsWith(globalContext.projectInfo.rootPath + "/node_modules")) {
                            // only resolve node package name, if it's an actual node module, not some re-mapped source file (see tsconfig.json -> "paths" option)
                            packageName = NodeUtils.getPackageNameForPath(globalContext.projectInfo.rootPath, resolvedModulePath);
                        }

                        if (packageName) {
                            target = FQN.id(`"${packageName}".${targetDeclName}`);
                        } else {
                            target = new FQN(
                                `"${resolvedModulePath}".${targetDeclName}`,
                                `"${ModulePathUtils.normalize(globalContext.projectInfo.rootPath, resolvedModulePath)}".${targetDeclName}`,
                            );
                        }
                    } catch (e) {
                        console.log("\n" + `Error: Could not resolve import path for: ${ModulePathUtils.extractFQNPath(target.globalFqn)}`);
                    }
                }

                // TODO: The registered declaration does not work for Node.js modules and potentially aliased exports
                DependencyResolutionProcessor.registerDeclaration(localContexts, specifier.local.name, target);
                // NOTE: Disabled depdenencies due to unresolvable FQNs of imported declarations that have received an alias on export.
                //       This means there will be no dependencies in the graph based solely on the existence of import statements.
                // concepts.push(
                //     singleEntryConceptMap(
                //         LCEDependency.conceptId,
                //         new LCEDependency(target, isModule ? "module" : "declaration", sourceFileFQN, "module", 1)
                //     )
                // );
            }
        }
        return mergeConceptMaps(...concepts);
    }
}
