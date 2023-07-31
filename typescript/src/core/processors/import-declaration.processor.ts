import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {ConceptMap, mergeConceptMaps, singleEntryConceptMap} from "../concept";
import {LCEDependency} from "../concepts/dependency.concept";
import {ProcessingContext} from "../context";
import {ExecutionCondition} from "../execution-condition";
import {PathUtils} from "../path.utils";
import {Processor} from "../processor";
import {DependencyResolutionProcessor} from "./dependency-resolution.processor";

export class ImportDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ImportDeclaration], () => true);

    public override postChildrenProcessing({node, localContexts, globalContext}: ProcessingContext): ConceptMap {
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
                    target = PathUtils.toFQN(importSource) + "." + specifier.imported.name;
                } else if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
                    target = PathUtils.toFQN(importSource) + ".default";
                } else if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
                    target = importSource;
                    isModule = true;
                }
                DependencyResolutionProcessor.registerDeclaration(localContexts, specifier.local.name, target);
                concepts.push(
                    singleEntryConceptMap(
                        LCEDependency.conceptId,
                        new LCEDependency(target, isModule ? "module" : "declaration", sourceFileFQN, "module", 1)
                    )
                );
            }
        }
        return mergeConceptMaps(...concepts);
    }
}
