import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, getAndCastConcepts, LCEConcept, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEClassDeclaration } from "../concepts/class-declaration.concept";
import { LCEEnumDeclaration } from "../concepts/enum-declaration.concept";
import { LCEExportDeclaration } from "../concepts/export-declaration.concept";
import { LCEFunctionDeclaration } from "../concepts/function-declaration.concept";
import { LCEInterfaceDeclaration } from "../concepts/interface-declaration.concept";
import { LCETypeAliasDeclaration } from "../concepts/type-alias-declaration.concept";
import { LCEVariableDeclaration } from "../concepts/variable-declaration.concept";
import { ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { Processor } from "../processor";
import { ExportDefaultDeclarationTraverser, ExportNamedDeclarationTraverser } from "../traversers/export-declaration.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";

export class ExportDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.ExportAllDeclaration, AST_NODE_TYPES.ExportDefaultDeclaration, AST_NODE_TYPES.ExportNamedDeclaration],
        () => true,
    );

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        const concepts: ConceptMap[] = [];
        if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
            let source: string | undefined;
            if (node.source) {
                source = ModulePathUtils.normalizeImportPath(
                    globalContext.projectInfo.rootPath,
                    node.source.value,
                    globalContext.sourceFilePathAbsolute,
                );
            }

            if (node.declaration) {
                // direct export of a declaration definition (e.g. "export class MyClass { ... }")
                const identifier = this.extractExportedIdentifier(childConcepts.get(ExportNamedDeclarationTraverser.DECLARATION_PROP));
                if (identifier) {
                    const globalDeclFqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts).globalFqn + identifier;
                    concepts.push(
                        singleEntryConceptMap(
                            LCEExportDeclaration.conceptId,
                            new LCEExportDeclaration(
                                identifier,
                                undefined,
                                globalDeclFqn,
                                undefined,
                                false,
                                node.exportKind,
                                globalContext.sourceFilePathAbsolute,
                            ),
                        ),
                    );
                }
            } else {
                // export of declaration list (e.g. "export {MyClass, MyFunc}")
                // may also contain a default export using the "default" specifier
                // may also be a re-export
                for (const specifier of node.specifiers) {
                    const globalDeclFqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts).globalFqn + specifier.local.name;
                    concepts.push(
                        singleEntryConceptMap(
                            LCEExportDeclaration.conceptId,
                            new LCEExportDeclaration(
                                specifier.local.name,
                                specifier.exported.name === "default" || specifier.exported.name === specifier.local.name
                                    ? undefined
                                    : specifier.exported.name,
                                globalDeclFqn,
                                source,
                                specifier.exported.name === "default",
                                node.exportKind,
                                globalContext.sourceFilePathAbsolute,
                            ),
                        ),
                    );
                }
            }
        } else if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            // default export (e.g. "export default myFunc")
            // NOTE: anonymous declaration may also be directly exported as default (in that case "default" is used as identifier name)
            const identifier = this.extractExportedIdentifier(childConcepts.get(ExportDefaultDeclarationTraverser.DECLARATION_PROP)) ?? "default";
            if (identifier) {
                const globalDeclFqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts).globalFqn + identifier;
                concepts.push(
                    singleEntryConceptMap(
                        LCEExportDeclaration.conceptId,
                        new LCEExportDeclaration(
                            identifier,
                            undefined,
                            globalDeclFqn,
                            undefined,
                            true,
                            node.exportKind,
                            globalContext.sourceFilePathAbsolute,
                        ),
                    ),
                );
            }
        } else if (node.type === AST_NODE_TYPES.ExportAllDeclaration && node.source) {
            // re-export of all declarations of a module (e.g. "export * from "./myModule")
            const source = ModulePathUtils.normalizeImportPath(
                globalContext.projectInfo.rootPath,
                node.source.value,
                globalContext.sourceFilePathAbsolute,
            );
            concepts.push(
                singleEntryConceptMap(
                    LCEExportDeclaration.conceptId,
                    new LCEExportDeclaration(
                        "*",
                        node.exported?.name,
                        DependencyResolutionProcessor.constructScopeFQN(localContexts).globalFqn,
                        source,
                        false,
                        "namespace",
                        globalContext.sourceFilePathAbsolute,
                    ),
                ),
            );
        }

        return mergeConceptMaps(...concepts);
    }

    private extractExportedIdentifier(exportedConcept?: Map<string, LCEConcept[]>): string | undefined {
        let identifier: string | undefined;
        if (exportedConcept) {
            if (exportedConcept.has(LCEClassDeclaration.conceptId)) {
                identifier = getAndCastConcepts<LCEClassDeclaration>(LCEClassDeclaration.conceptId, exportedConcept)[0].className;
            } else if (exportedConcept.has(LCEInterfaceDeclaration.conceptId)) {
                identifier = getAndCastConcepts<LCEInterfaceDeclaration>(LCEInterfaceDeclaration.conceptId, exportedConcept)[0].interfaceName;
            } else if (exportedConcept.has(LCEFunctionDeclaration.conceptId)) {
                identifier = getAndCastConcepts<LCEFunctionDeclaration>(LCEFunctionDeclaration.conceptId, exportedConcept)[0].functionName;
            } else if (exportedConcept.has(LCETypeAliasDeclaration.conceptId)) {
                identifier = getAndCastConcepts<LCETypeAliasDeclaration>(LCETypeAliasDeclaration.conceptId, exportedConcept)[0].typeAliasName;
            } else if (exportedConcept.has(LCEEnumDeclaration.conceptId)) {
                identifier = getAndCastConcepts<LCEEnumDeclaration>(LCEEnumDeclaration.conceptId, exportedConcept)[0].enumName;
            } else if (exportedConcept.has(LCEVariableDeclaration.conceptId)) {
                identifier = getAndCastConcepts<LCEVariableDeclaration>(LCEVariableDeclaration.conceptId, exportedConcept)[0].variableName;
            }
        }
        return identifier;
    }
}
