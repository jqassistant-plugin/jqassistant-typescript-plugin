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
import { PathUtils } from "../utils/path.utils";
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
            let inProject, source;
            if (node.source) {
                source = PathUtils.normalizeImportPath(globalContext.projectRootPath, node.source.value, globalContext.sourceFilePath);
                inProject = !PathUtils.isExternal(source);
            }

            if (node.declaration) {
                const identifier = this.extractExportedIdentifier(childConcepts.get(ExportNamedDeclarationTraverser.DECLARATION_PROP));
                if (identifier) {
                    const fqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts) + identifier;
                    concepts.push(
                        singleEntryConceptMap(
                            LCEExportDeclaration.conceptId,
                            new LCEExportDeclaration(
                                identifier,
                                undefined,
                                fqn,
                                undefined,
                                undefined,
                                false,
                                node.exportKind,
                                globalContext.sourceFilePath,
                            ),
                        ),
                    );
                }
            } else {
                for (const specifier of node.specifiers) {
                    const fqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts) + specifier.local.name;
                    concepts.push(
                        singleEntryConceptMap(
                            LCEExportDeclaration.conceptId,
                            new LCEExportDeclaration(
                                specifier.local.name,
                                specifier.exported.name === "default" || specifier.exported.name === specifier.local.name
                                    ? undefined
                                    : specifier.exported.name,
                                fqn,
                                source,
                                inProject,
                                specifier.exported.name === "default",
                                node.exportKind,
                                globalContext.sourceFilePath,
                            ),
                        ),
                    );
                }
            }
        } else if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            const identifier = this.extractExportedIdentifier(childConcepts.get(ExportDefaultDeclarationTraverser.DECLARATION_PROP));
            if (identifier) {
                const fqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts) + identifier;
                concepts.push(
                    singleEntryConceptMap(
                        LCEExportDeclaration.conceptId,
                        new LCEExportDeclaration(
                            identifier,
                            undefined,
                            fqn,
                            undefined,
                            undefined,
                            true,
                            node.exportKind,
                            globalContext.sourceFilePath,
                        ),
                    ),
                );
            }
        } else if (node.type === AST_NODE_TYPES.ExportAllDeclaration && node.source) {
            const source = PathUtils.normalizeImportPath(globalContext.projectRootPath, node.source.value, globalContext.sourceFilePath);
            const inProject = !PathUtils.isExternal(source);
            concepts.push(
                singleEntryConceptMap(
                    LCEExportDeclaration.conceptId,
                    new LCEExportDeclaration(
                        "*",
                        node.exported?.name,
                        DependencyResolutionProcessor.constructScopeFQN(localContexts),
                        source,
                        inProject,
                        false,
                        "namespace",
                        globalContext.sourceFilePath,
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
