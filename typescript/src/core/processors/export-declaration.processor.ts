import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, getAndCastConcepts, LCEConcept, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEClassDeclaration } from "../concepts/class-declaration.concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { LCEEnumDeclaration } from "../concepts/enum-declaration.concept";
import { LCEExportDeclaration } from "../concepts/export-declaration.concept";
import { LCEFunctionDeclaration } from "../concepts/function-declaration.concept";
import { LCEInterfaceDeclaration } from "../concepts/interface-declaration.concept";
import { LCETypeAliasDeclaration } from "../concepts/type-alias-declaration.concept";
import { LCEVariableDeclaration } from "../concepts/variable-declaration.concept";
import { GlobalContext, LocalContexts, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { NodeUtils } from "../utils/node.utils";
import { debug } from "../utils/log.utils";
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
                source = this.resolveImportSource(node.source.value, globalContext);
            }

            if (node.declaration) {
                // direct export of a declaration definition (e.g. "export class MyClass { ... }")
                const declaration = this.extractExportedDeclaration(childConcepts.get(ExportNamedDeclarationTraverser.DECLARATION_PROP));
                if (declaration) {
                    concepts.push(
                        singleEntryConceptMap(
                            LCEExportDeclaration.conceptId,
                            new LCEExportDeclaration(
                                declaration.identifier,
                                undefined,
                                declaration.globalFqn,
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
                    const localName = specifier.local.type === AST_NODE_TYPES.Identifier ? specifier.local.name : specifier.local.raw;
                    const exportedName = specifier.exported.type === AST_NODE_TYPES.Identifier ? specifier.exported.name : specifier.exported.raw;
                    // a default-exported declaration is named "default" (e.g. "export { MyClass }; export default MyClass;")
                    const declName =
                        !source && localName === DependencyResolutionProcessor.getDefaultExportIdentifier(localContexts) ? "default" : localName;
                    const globalDeclFqn = DependencyResolutionProcessor.constructFQNPrefix(localContexts).globalFqn + declName;
                    const exportDeclaration = new LCEExportDeclaration(
                        localName,
                        exportedName === "default" || exportedName === localName ? undefined : exportedName,
                        globalDeclFqn,
                        source,
                        exportedName === "default",
                        node.exportKind,
                        globalContext.sourceFilePathAbsolute,
                    );
                    concepts.push(singleEntryConceptMap(LCEExportDeclaration.conceptId, exportDeclaration));
                    if (!source) {
                        // the exported name may be imported (e.g. "import { MyClass } from "./myModule"; export { MyClass };")
                        const dependency = this.resolveExportedName(localContexts, globalContext, localName, exportedName, exportDeclaration);
                        concepts.push(singleEntryConceptMap(LCEDependency.conceptId, dependency));
                    }
                }
            }
        } else if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            // default export (e.g. "export default myFunc")
            // NOTE: anonymous declaration may also be directly exported as default (in that case "default" is used as identifier name)
            const declaration = this.extractExportedDeclaration(childConcepts.get(ExportDefaultDeclarationTraverser.DECLARATION_PROP));
            const exportDeclaration = new LCEExportDeclaration(
                declaration?.identifier ?? "default",
                undefined,
                declaration?.globalFqn ?? DependencyResolutionProcessor.constructFQNPrefix(localContexts).globalFqn + "default",
                undefined,
                true,
                node.exportKind,
                globalContext.sourceFilePathAbsolute,
            );
            concepts.push(singleEntryConceptMap(LCEExportDeclaration.conceptId, exportDeclaration));
            if (node.declaration.type === AST_NODE_TYPES.Identifier) {
                // the exported name may be imported (e.g. "import MyClass from "./myModule"; export default MyClass;")
                const dependency = this.resolveExportedName(localContexts, globalContext, node.declaration.name, "default", exportDeclaration);
                concepts.push(singleEntryConceptMap(LCEDependency.conceptId, dependency));
            }
        } else if (node.type === AST_NODE_TYPES.ExportAllDeclaration && node.source) {
            // re-export of all declarations of a module (e.g. "export * from "./myModule")
            const source = this.resolveImportSource(node.source.value, globalContext);
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

    /**
     * Resolves the module specifier of a re-export the way TypeScript resolves imports, using the compiler options of the project
     * (e.g. `"./a.js"` refers to `a.ts` and `"./lib/index"` to `lib/index.ts`).
     * @returns absolute path of the re-exported module, or the unchanged module specifier for modules of Node.js packages
     */
    private resolveImportSource(importPath: string, globalContext: GlobalContext): string {
        try {
            const resolvedPath = NodeUtils.resolveImportPath(importPath, globalContext.projectInfo, globalContext.sourceFilePathAbsolute);
            if (!resolvedPath.split("/").includes("node_modules")) {
                return resolvedPath;
            }
        } catch (e) {
            debug(`Could not resolve re-exported module "${importPath}"\n\toccurred at ${globalContext.sourceFilePathAbsolute}`);
        }
        return ModulePathUtils.normalizeImportPath(globalContext.projectInfo.rootPath, importPath, globalContext.sourceFilePathAbsolute);
    }

    /**
     * Resolves the local name of an export without import source at the end of the file with the declaration index.
     * This makes the export of an imported name point to the original declaration.
     * The export of an imported module becomes a namespace re-export (e.g. "import * as ns from "./myModule"; export { ns };"
     * is handled like "export * as ns from "./myModule"").
     * @returns dependency of the module on the exported declaration, like for a re-export with import source (see `ExportsPostProcessor`).
     *          It is only valid if a declaration is imported: otherwise its FQN stays unresolved, so that the dependency is skipped
     *          (like an unresolved one of `registerDependency()`).
     */
    private resolveExportedName(
        localContexts: LocalContexts,
        globalContext: GlobalContext,
        localName: string,
        exportedName: string,
        exportDeclaration: LCEExportDeclaration,
    ): LCEDependency {
        const moduleFqn = DependencyResolutionProcessor.constructScopeFQN(localContexts).globalFqn;
        const dependency = new LCEDependency(localName, "declaration", globalContext.sourceFilePathAbsolute, "module", 1);
        DependencyResolutionProcessor.scheduleFqnResolutionCallback(localContexts, localName, (fqn) => {
            if (!fqn.globalFqn) {
                // unresolvable import
                return;
            } else if (!fqn.globalFqn.startsWith('"')) {
                // imported module: the path of the module or the name of an ambient module (e.g. "fs")
                exportDeclaration.identifier = "*";
                exportDeclaration.alias = exportedName;
                exportDeclaration.globalDeclFqn = moduleFqn;
                exportDeclaration.importSource = fqn.globalFqn;
                exportDeclaration.isDefault = false;
                exportDeclaration.kind = "namespace";
            } else if (!ModulePathUtils.isFQNModule(fqn.globalFqn)) {
                exportDeclaration.globalDeclFqn = fqn.globalFqn;
                if (!fqn.globalFqn.startsWith(moduleFqn + ".")) {
                    dependency.fqn = fqn;
                }
            }
        });
        return dependency;
    }

    /**
     * @returns name and global FQN of the exported declaration (the FQN of a default-exported declaration ends with "default")
     */
    private extractExportedDeclaration(exportedConcept?: Map<string, LCEConcept[]>): { identifier: string; globalFqn: string } | undefined {
        if (exportedConcept) {
            if (exportedConcept.has(LCEClassDeclaration.conceptId)) {
                const decl = getAndCastConcepts<LCEClassDeclaration>(LCEClassDeclaration.conceptId, exportedConcept)[0];
                return { identifier: decl.className, globalFqn: decl.fqn.globalFqn };
            } else if (exportedConcept.has(LCEInterfaceDeclaration.conceptId)) {
                const decl = getAndCastConcepts<LCEInterfaceDeclaration>(LCEInterfaceDeclaration.conceptId, exportedConcept)[0];
                return { identifier: decl.interfaceName, globalFqn: decl.fqn.globalFqn };
            } else if (exportedConcept.has(LCEFunctionDeclaration.conceptId)) {
                const decl = getAndCastConcepts<LCEFunctionDeclaration>(LCEFunctionDeclaration.conceptId, exportedConcept)[0];
                return { identifier: decl.functionName, globalFqn: decl.fqn.globalFqn };
            } else if (exportedConcept.has(LCETypeAliasDeclaration.conceptId)) {
                const decl = getAndCastConcepts<LCETypeAliasDeclaration>(LCETypeAliasDeclaration.conceptId, exportedConcept)[0];
                return { identifier: decl.typeAliasName, globalFqn: decl.fqn.globalFqn };
            } else if (exportedConcept.has(LCEEnumDeclaration.conceptId)) {
                const decl = getAndCastConcepts<LCEEnumDeclaration>(LCEEnumDeclaration.conceptId, exportedConcept)[0];
                return { identifier: decl.enumName, globalFqn: decl.fqn.globalFqn };
            } else if (exportedConcept.has(LCEVariableDeclaration.conceptId)) {
                const decl = getAndCastConcepts<LCEVariableDeclaration>(LCEVariableDeclaration.conceptId, exportedConcept)[0];
                return { identifier: decl.variableName, globalFqn: decl.fqn.globalFqn };
            }
        }
        return undefined;
    }
}
