import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";

import { ConceptMap, createConceptMap, LCENamedConcept, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { FQN, LocalContexts, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { Processor } from "../processor";
import { getAndDeleteChildConcepts } from "../utils/processor.utils";
import { ProgramTraverser } from "../traversers/program.traverser";
import { CoreContextKeys } from "../context.keys";

/**
 * Maps (global) namespace identifier and local name to a FQN for all global and local declarations made within the current file.
 */
export type DeclarationIndex = Map<string, Map<string, FQN>>;

/**
 * List of references that need to be resolved.
 *
 * [global FQN namespace stack, local identifier of reference, reference object]
 */
export type FQNResolverContext = Array<[string[], string, LCENamedConcept]>;

/**
 * Stores the identifiers for the declaration that encompasses the currently traversed part of the AST.
 * Multiple of these scopes can be set as Local Contexts on different levels to express nested scopes (e.g a method within a class).
 *
 * see `DependencyResolutionProcessor` for more detail.
 */
export interface FQNScope {
    globalIdentifier: string;
    localIdentifier: string;
    internalScopeId: number;
}

/**
 * Manages FQN contexts, provides index for registering declarations and resolves FQN references.
 */
export class DependencyResolutionProcessor extends Processor {

    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Program], () => true);

    public override preChildrenProcessing({localContexts, globalContext, node}: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.DECLARATION_INDEX, new Map());

        const scopeIdentifier = ModulePathUtils.toFQN(globalContext.sourceFilePathAbsolute, globalContext.sourceFilePathRelative);
        localContexts.currentContexts.set(CoreContextKeys.FQN_SCOPE, {
            globalIdentifier: scopeIdentifier.globalFqn,
            localIdentifier: scopeIdentifier.localFqn,
            internalScopeId: 0,
        } as FQNScope);

        localContexts.currentContexts.set(CoreContextKeys.FQN_RESOLVER, []);
        localContexts.currentContexts.set(CoreContextKeys.DEPENDENCY_GLOBAL_SOURCE_FQN, ModulePathUtils.toFQN(globalContext.sourceFilePathAbsolute).globalFqn);
        localContexts.currentContexts.set(CoreContextKeys.DEPENDENCY_INDEX, []);

        // if a declaration is default-exported: register its name
        if(node.type === AST_NODE_TYPES.Program) {
            for(const statement of node.body) {
                if(statement.type === AST_NODE_TYPES.ExportDefaultDeclaration && statement.declaration.type === AST_NODE_TYPES.Identifier) {
                    localContexts.currentContexts.set(CoreContextKeys.DEFAULT_EXPORT_IDENTIFIER, statement.declaration.name);
                    break;
                }
            }
        }
    }

    public override postChildrenProcessing({localContexts}: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        const [declIndex] = localContexts.getNextContext(CoreContextKeys.DECLARATION_INDEX) as [DeclarationIndex, number];
        const [resolutionList] = localContexts.getNextContext(CoreContextKeys.FQN_RESOLVER) as [FQNResolverContext, number];

        // resolve FQNs
        for (const [namespaces, identifier, concept] of resolutionList) {
            if (identifier.includes(".")) {
                // complex identifier: multiple tries
                const identifiers = identifier.split(".");
                let resultFound = false;

                // test full identifier names from bottom to top (e.g. "a.b.c" => "a.b.c", "a.b", "a")
                for (let i = identifiers.length; i > 0; i--) {
                    const testIdentifier = identifiers.slice(0, i).join(".");
                    if (this.resolveFQN(declIndex, namespaces, testIdentifier, concept)) {
                        resultFound = true;
                        break;
                    }
                }
                if (resultFound) continue;

                // test partial identifier names from bottom to top (e.g. "a.b.c" => "c", "b.c", "a.b.c")
                for (let i = identifiers.length - 1; i > 0; i--) {
                    const testIdentifier = identifiers.slice(i).join(".");
                    if (this.resolveFQN(declIndex, namespaces, testIdentifier, concept)) {
                        resultFound = true;
                        break;
                    }
                }
            } else {
                // simple identifier: resolve it
                this.resolveFQN(declIndex, namespaces, identifier, concept);
            }
        }

        // merge dependencies
        const dependencies = getAndDeleteChildConcepts<LCEDependency>(
            ProgramTraverser.PROGRAM_BODY_PROP,
            LCEDependency.conceptId,
            childConcepts
        ).concat(localContexts.currentContexts.get(CoreContextKeys.DEPENDENCY_INDEX) as LCEDependency[]);
        const depIndex: Map<string, Map<string, LCEDependency>> = new Map();
        for (const dep of dependencies) {
            if (!dep.fqn.globalFqn) continue;

            if ((!dep.fqn.globalFqn.startsWith('"') && dep.targetType !== "module") || dep.fqn.globalFqn === dep.globalSourceFQN) continue; // skip invalid FQNs and dependencies with same source and target

            if (!depIndex.has(dep.globalSourceFQN)) {
                depIndex.set(dep.globalSourceFQN, new Map([[dep.fqn.globalFqn, dep]]));
            } else if (!depIndex.get(dep.globalSourceFQN)?.has(dep.fqn.globalFqn)) {
                depIndex.get(dep.globalSourceFQN)?.set(dep.fqn.globalFqn, dep);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                depIndex.get(dep.globalSourceFQN)!.get(dep.fqn.globalFqn)!.cardinality += dep.cardinality;
            }
        }

        // return merged dependencies
        const concepts: ConceptMap[] = [];
        depIndex.forEach((valMap) => {
            valMap.forEach((val) => {
                concepts.push(singleEntryConceptMap(LCEDependency.conceptId, val));
            });
        });

        return mergeConceptMaps(...concepts);
    }

    /**
     * Tries to resolve the FQN of a concept by a given list of (global) namespace identifiers and the local name of the declaration.
     *
     * @param declIndex the {@link DeclarationIndex} containing all registered declarations
     * @param namespaces list of global namespace identifiers that were present during the resolution scheduling
     * @param identifier local name of the declaration
     * @param concept concept to which the FQN should be resolved and assigned to
     * @returns whether the resolution was successful
     */
    private resolveFQN(declIndex: DeclarationIndex, namespaces: string[], identifier: string, concept: LCENamedConcept): boolean {
        for (let i = namespaces.length; i > 0; i--) {
            const testNamespace = namespaces.slice(0, i).join(".");
            if (declIndex.has(testNamespace) && declIndex.get(testNamespace)?.has(identifier)) {
                concept.fqn = declIndex.get(testNamespace)?.get(identifier) as FQN;
                return true;
            }
        }
        return false;
    }

    /**
     * Constructs the prefix for a FQN based on the current scope.
     * @param skipLastScope when set to true, the current scope is not included in the FQN prefix.
     */
    public static constructFQNPrefix(localContexts: LocalContexts, skipLastScope = false): FQN {
        let result = FQN.id("");
        for (let i = 0; i < localContexts.contexts.length - (skipLastScope ? 1 : 0); i++) {
            const context = localContexts.contexts[i];
            const globalName: string | undefined = (context.get(CoreContextKeys.FQN_SCOPE) as FQNScope)?.globalIdentifier;
            const localName: string | undefined = (context.get(CoreContextKeys.FQN_SCOPE) as FQNScope)?.localIdentifier;
            if (globalName && localName) {
                result.globalFqn += globalName + ".";
                result.localFqn += localName + ".";
            }
        }
        return result;
    }

    /**
     * Constructs the complete FQN (local and global) for a given declaration.
     */
    public static constructDeclarationFQN(localContexts: LocalContexts, declarationNode: Node, identifier: string) {
        const fqnPrefix = DependencyResolutionProcessor.constructFQNPrefix(localContexts);
        if(this.isDefaultDeclaration(localContexts, declarationNode, identifier)) {
            return new FQN(
                fqnPrefix.globalFqn + "default",
                fqnPrefix.localFqn + "default"
            );
        } else {
            return new FQN(
                fqnPrefix.globalFqn + identifier,
                fqnPrefix.localFqn + identifier
            );
        }
    }


    /**
     * Determines the identifier of a given declaration. Don't use on unnamed declarations that are not default-exported!
     */
    public static constructDeclarationIdentifier(localContexts: LocalContexts, declarationNode: Node, nodeIdentifier?: string) {
        let id = DependencyResolutionProcessor.isDefaultDeclaration(localContexts, declarationNode, nodeIdentifier) ? "default" : nodeIdentifier;
        if(id === "default") {
            if(nodeIdentifier) {
                id = nodeIdentifier;
            } else {
                const srcPath = (localContexts.contexts[0].get(CoreContextKeys.FQN_SCOPE) as FQNScope).globalIdentifier;
                id = srcPath.substring(srcPath.lastIndexOf("/") + 1, srcPath.includes(".") ? srcPath.indexOf(".") : (srcPath.length - 1));
            }
        }
        if(!id) {
            throw new Error("Cannot determine identifier of declaration")
        }
        return id;
    }

    /**
     * Constructs the FQN for the current scope.
     * @param skipLastScope when set to true, the current scope is not included in the FQN.
     */
    public static constructScopeFQN(localContexts: LocalContexts, skipLastScope = false): FQN {
        const prefix = this.constructFQNPrefix(localContexts, skipLastScope);
        return new FQN(
            prefix.globalFqn.substring(0, prefix.globalFqn.length - 1),
            prefix.localFqn.substring(0, prefix.localFqn.length - 1)
        );
    }

    /**
     * Register a declaration for the current scope.
     * This information is used later to resolve FQNs.
     * @param localName local name under which the declaration is used
     * @param fqn fully qualified name of the declaration
     * @param insideScopeDeclaration specifies whether the declaration is registered while traversing its own scope
     */
    public static registerDeclaration(localContexts: LocalContexts, localName: string, fqn: FQN, insideScopeDeclaration = false): void {
        const [declIndex] = localContexts.getNextContext(CoreContextKeys.DECLARATION_INDEX) as [DeclarationIndex, number];
        const scope = this.constructScopeFQN(localContexts, insideScopeDeclaration);
        if (!declIndex.has(scope.globalFqn)) declIndex.set(scope.globalFqn, new Map());
        declIndex.get(scope.globalFqn)?.set(localName, fqn);
    }

    /**
     * Schedules the resolution of a FQN for a named concept.
     * The resolution happens after the AST has been traversed completely.
     * @param localName local name of the concept that will be used to resolve the FQN (e.g. variable name)
     * @param concept named concept with the fqn property that will be resolved
     */
    public static scheduleFqnResolution(localContexts: LocalContexts, localName: string, concept: LCENamedConcept): void {
        const namespaces: string[] = [];
        for (const context of localContexts.contexts) {
            const name: string | undefined = (context.get(CoreContextKeys.FQN_SCOPE) as FQNScope)?.globalIdentifier;
            if (name) {
                namespaces.push(name);
            }
        }
        const [resolutionList] = localContexts.getNextContext(CoreContextKeys.FQN_RESOLVER) as [FQNResolverContext, number];
        resolutionList.push([namespaces, localName, concept]);
    }

    /**
     * Introduces a new scope (e.g. for a function or a simple block statement).
     * This will be used to generate FQNs for declarations made within the scope.
     * @param scopeIdentifier can be used to identify the scope (e.g. with function name),
     * if undefined the scope will be identified by a unique number
     */
    public static addScopeContext(localContexts: LocalContexts, scopeIdentifier?: FQN): void {
        if (localContexts.currentContexts.has(CoreContextKeys.FQN_SCOPE)) {
            // if scope context is already present, ignore this call
            return;
        }

        if (!scopeIdentifier) {
            const internalScopeId = (localContexts.getNextContext(CoreContextKeys.FQN_SCOPE) as FQNScope[])[0].internalScopeId.toString();
            scopeIdentifier = FQN.id(internalScopeId);
            (localContexts.getNextContext(CoreContextKeys.FQN_SCOPE) as FQNScope[])[0].internalScopeId++;
        }
        localContexts.currentContexts.set(CoreContextKeys.FQN_SCOPE, {
            globalIdentifier: scopeIdentifier.globalFqn,
            localIdentifier: scopeIdentifier.localFqn,
            internalScopeId: 0,
        } as FQNScope);
    }

    /**
     * Creates a new dependency index for the current namespace FQN.
     * Use `getRegisteredDependencies()` to get all registered dependencies from children and return them in `postChildrenProcessing()`.
     * @param globalFqn use this to specify different global FQN than the one of the current namespace
     */
    public static createDependencyIndex(localContexts: LocalContexts, globalFqn?: string): void {
        localContexts.currentContexts.set(
            CoreContextKeys.DEPENDENCY_GLOBAL_SOURCE_FQN,
            globalFqn ?? DependencyResolutionProcessor.constructScopeFQN(localContexts).globalFqn
        );
        localContexts.currentContexts.set(CoreContextKeys.DEPENDENCY_INDEX, []);
    }

    /**
     * Registers a dependency on a declaration
     * @param depGlobalFQN global FQN of the dependency (does not need to be resolved yet)
     * @param resolveFQN if set to true(default) automatically schedules resolution of the dependency FQN
     */
    public static registerDependency(localContexts: LocalContexts, depGlobalFQN: string, resolveFQN = true): void {
        const [depIndex] = localContexts.getNextContext(CoreContextKeys.DEPENDENCY_INDEX) as [LCEDependency[], number];
        const [depSourceFQN] = localContexts.getNextContext(CoreContextKeys.DEPENDENCY_GLOBAL_SOURCE_FQN) as [string, number];
        const dep = new LCEDependency(depGlobalFQN, "declaration", depSourceFQN, ModulePathUtils.isFQNModule(depSourceFQN) ? "module" : "declaration", 1);
        if (resolveFQN) {
            this.scheduleFqnResolution(localContexts, depGlobalFQN, dep);
        }
        depIndex.push(dep);
    }

    /**
     * @returns all registered dependencies of the current dependency index as a `ConceptMap`
     */
    public static getRegisteredDependencies(localContexts: LocalContexts): ConceptMap {
        return createConceptMap(
            LCEDependency.conceptId,
            (localContexts.getNextContext(CoreContextKeys.DEPENDENCY_INDEX) as [LCEDependency[], number])[0]
        );
    }

    /**
     * @returns whether a declaration is default-exported.
     */
    public static isDefaultDeclaration(localContexts: LocalContexts, declarationNode: Node, identifier?: string): boolean {
        const defaultIdentifierContext  = localContexts.getNextContext(CoreContextKeys.DEFAULT_EXPORT_IDENTIFIER) as [string, number] | undefined;
        return declarationNode.parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
            (!!identifier && !!defaultIdentifierContext && defaultIdentifierContext[0] === identifier);
    }
}
