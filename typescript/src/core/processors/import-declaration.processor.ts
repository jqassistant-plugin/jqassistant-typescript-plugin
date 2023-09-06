import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { PathUtils } from "../utils/path.utils";
import { Processor } from "../processor";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { NodeUtils } from "../utils/node.utils";

export class ImportDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ImportDeclaration], () => true);

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext): ConceptMap {
        // TODO: resolve complex import paths, e.g. https://stackoverflow.com/questions/42749973/what-does-the-mean-inside-an-import-path
        // TODO: resolve internal node packages to paths
        const concepts: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ImportDeclaration) {
            const sourceFileFQN = globalContext.sourceFilePath;
            const importSource = PathUtils.normalizeImportPath(globalContext.projectRootPath, node.source.value, globalContext.sourceFilePath);
            for (const specifier of node.specifiers) {
                let target = "";
                let isModule = false;
                if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
                    const node = globalContext.services.esTreeNodeToTSNodeMap.get(specifier);
                    const type = globalContext.typeChecker.getTypeAtLocation(node);
                    const symbol = globalContext.typeChecker.getSymbolAtLocation(node);
                    target = PathUtils.toFQN(importSource) + "." + specifier.imported.name;
                } else if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
                    target = PathUtils.toFQN(importSource) + ".default";
                } else if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
                    target = importSource;
                    isModule = true;
                }

                if (target.startsWith('"') && PathUtils.getPathType(PathUtils.extractFQNPath(target)) === "node") {
                    // resolve node package names to the appropriate paths
                    try {
                        const resolvedModulePath = require
                            .resolve(PathUtils.extractFQNPath(target), { paths: [globalContext.projectRootPath] })
                            .replace(/\\/g, "/");
                        const targetDeclName = PathUtils.extractFQNIdentifier(target);
                        const packageName = NodeUtils.getPackageNameForPath(globalContext.projectRootPath, resolvedModulePath);
                        if (packageName) {
                            target = `"${packageName}".${targetDeclName}`;
                        } else {
                            target = `"${PathUtils.normalize(globalContext.projectRootPath, resolvedModulePath)}".${targetDeclName}`;
                        }
                    } catch (e) {
                        console.log("\n" + `Error: Could not resolve import path for: ${PathUtils.extractFQNPath(target)}`);
                    }
                }

                // TODO: The registered declaration does not work for Node.js modules and potentially aliased exports
                DependencyResolutionProcessor.registerDeclaration(localContexts, specifier.local.name, target);
                // NOTE: Disabled depdencencies due to unresolvable FQNs of imported declarations that have received an alias on export.
                //       This means there will be no dependencies in the graph based on the existence of import statements.
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
