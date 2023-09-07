import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, createConceptMap, LCENamedConcept, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { LocalContexts, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { PathUtils } from "../utils/path.utils";
import { Processor } from "../processor";
import { getAndDeleteChildConcepts } from "../utils/processor.utils";
import { ProgramTraverser } from "../traversers/program.traverser";

/**
 * Maps namespace identifier and local name to FQN for all global and local declarations made within the current file.
 */
export type DeclarationIndex = Map<string, Map<string, string>>;

/**
 * List of references that need to be resolved.
 *
 * [FQN namespace stack, local identifier of reference, reference object]
 */
export type FQNResolverContext = Array<[string[], string, LCENamedConcept]>;

export interface FQNScope {
    identifier: string;
    internalScopeId: number;
}

/**
 * Manages FQN contexts, provides index for registering declarations and resolves FQN references.
 */
export class DependencyResolutionProcessor extends Processor {
    /** key to the dependency index, used for registering all declarations made within a module (`DeclarationIndex`) */
    public static readonly DECLARATION_INDEX_CONTEXT = "declaration-index";

    /** key to the current scope object, used to introduce new FQN scoping levels (`FQNScope`) */
    public static readonly FQN_SCOPE_CONTEXT = "fqn-scope";

    /** key to the FQN resolver index, used to schedule FQN resolutions (`FQNResolverContext`) */
    public static readonly FQN_RESOLVER_CONTEXT = "fqn-resolver";

    /** key to the FQN of the declaration that any newly discovered dependencies are added to (`string`) */
    public static readonly DEPENDENCY_SOURCE_FQN_CONTEXT = "dependency-fqn";

    /** key to the dependency index of the current dependency fqn (`Array<LCEDependency>`) */
    public static readonly DEPENDENCY_INDEX_CONTEXT = "dependency-index";

    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Program], () => true);

    public override preChildrenProcessing({localContexts, globalContext}: ProcessingContext): void {
        localContexts.currentContexts.set(DependencyResolutionProcessor.DECLARATION_INDEX_CONTEXT, new Map());
        localContexts.currentContexts.set(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT, {
            identifier: PathUtils.toFQN(globalContext.sourceFilePath),
            internalScopeId: 0,
        } as FQNScope);
        localContexts.currentContexts.set(DependencyResolutionProcessor.FQN_RESOLVER_CONTEXT, []);
        localContexts.currentContexts.set(DependencyResolutionProcessor.DEPENDENCY_SOURCE_FQN_CONTEXT, PathUtils.toFQN(globalContext.sourceFilePath));
        localContexts.currentContexts.set(DependencyResolutionProcessor.DEPENDENCY_INDEX_CONTEXT, []);
    }

    public override postChildrenProcessing({localContexts}: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        const [declIndex] = localContexts.getNextContext(DependencyResolutionProcessor.DECLARATION_INDEX_CONTEXT) as [DeclarationIndex, number];
        const [resolutionList] = localContexts.getNextContext(DependencyResolutionProcessor.FQN_RESOLVER_CONTEXT) as [FQNResolverContext, number];

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
        ).concat(localContexts.currentContexts.get(DependencyResolutionProcessor.DEPENDENCY_INDEX_CONTEXT) as LCEDependency[]);
        const depIndex: Map<string, Map<string, LCEDependency>> = new Map();
        for (const dep of dependencies) {
            if (!dep.fqn) continue;

            if ((!dep.fqn.startsWith('"') && dep.targetType !== "module") || dep.fqn.startsWith(dep.sourceFQN)) continue; // skip invalid FQNs and dependencies on own scope

            if (!depIndex.has(dep.sourceFQN)) {
                depIndex.set(dep.sourceFQN, new Map([[dep.fqn, dep]]));
            } else if (!depIndex.get(dep.sourceFQN)?.has(dep.fqn)) {
                depIndex.get(dep.sourceFQN)?.set(dep.fqn, dep);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                depIndex.get(dep.sourceFQN)!.get(dep.fqn)!.cardinality += dep.cardinality;
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

    private resolveFQN(declIndex: DeclarationIndex, namespaces: string[], identifier: string, concept: LCENamedConcept): boolean {
        for (let i = namespaces.length; i > 0; i--) {
            const testNamespace = namespaces.slice(0, i).join(".");
            if (declIndex.has(testNamespace) && declIndex.get(testNamespace)?.has(identifier)) {
                concept.fqn = declIndex.get(testNamespace)?.get(identifier) as string;
                return true;
            }
        }
        return false;
    }

    /**
     * Constructs the prefix for a FQN based on the current scope.
     * @param skipLastScope when set to true, the current scope is not included in the FQN prefix.
     */
    public static constructFQNPrefix(localContexts: LocalContexts, skipLastScope = false): string {
        let result = "";
        for (let i = 0; i < localContexts.contexts.length - (skipLastScope ? 1 : 0); i++) {
            const context = localContexts.contexts[i];
            const name: string | undefined = (context.get(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT) as FQNScope)?.identifier;
            if (name) {
                result += name + ".";
            }
        }
        return result;
    }

    /**
     * Constructs the FQN for the current scope.
     * @param skipLastScope when set to true, the current scope is not included in the FQN.
     */
    public static constructScopeFQN(localContexts: LocalContexts, skipLastScope = false): string {
        const result = this.constructFQNPrefix(localContexts, skipLastScope);
        return result.substring(0, result.length - 1);
    }

    /**
     * Register a declaration for the current scope.
     * This information is used later to resolve FQNs.
     * @param localName local name under which the declaration is used
     * @param fqn fully qualified name of the declaration
     * @param insideScopeDeclaration specifies whether the declaration is registered while traversing its own scope
     */
    public static registerDeclaration(localContexts: LocalContexts, localName: string, fqn: string, insideScopeDeclaration = false): void {
        const [declIndex] = localContexts.getNextContext(DependencyResolutionProcessor.DECLARATION_INDEX_CONTEXT) as [DeclarationIndex, number];
        const scope = this.constructScopeFQN(localContexts, insideScopeDeclaration);
        if (!declIndex.has(scope)) declIndex.set(scope, new Map());
        declIndex.get(scope)?.set(localName, fqn);
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
            const name: string | undefined = (context.get(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT) as FQNScope)?.identifier;
            if (name) {
                namespaces.push(name);
            }
        }
        const [resolutionList] = localContexts.getNextContext(DependencyResolutionProcessor.FQN_RESOLVER_CONTEXT) as [FQNResolverContext, number];
        resolutionList.push([namespaces, localName, concept]);
    }

    /**
     * Introduces a new scope (e.g. for a function or a simple block statement).
     * This will be used to generate FQNs for declarations made within the scope.
     * @param scopeIdentifier can be used to identify the scope (e.g. with function name),
     * if undefined the scope will be identified by a unique number
     */
    public static addScopeContext(localContexts: LocalContexts, scopeIdentifier?: string): void {
        if (localContexts.currentContexts.has(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT)) {
            // if scope context is already present, ignore this call
            return;
        }

        if (!scopeIdentifier) {
            scopeIdentifier = (
                localContexts.getNextContext(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT) as FQNScope[]
            )[0].internalScopeId.toString();
            (localContexts.getNextContext(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT) as FQNScope[])[0].internalScopeId++;
        }
        localContexts.currentContexts.set(DependencyResolutionProcessor.FQN_SCOPE_CONTEXT, {
            identifier: scopeIdentifier,
            internalScopeId: 0,
        } as FQNScope);
    }

    /**
     * Creates a new dependency index for the current namespace FQN.
     * Use `getRegisteredDependencies()` to get all registered dependencies from children and return them in `postChildrenProcessing()`.
     * @param fqn use this to specify different FQN than the one of the current namespace
     */
    public static createDependencyIndex(localContexts: LocalContexts, fqn?: string): void {
        localContexts.currentContexts.set(
            DependencyResolutionProcessor.DEPENDENCY_SOURCE_FQN_CONTEXT,
            fqn ?? DependencyResolutionProcessor.constructScopeFQN(localContexts)
        );
        localContexts.currentContexts.set(DependencyResolutionProcessor.DEPENDENCY_INDEX_CONTEXT, []);
    }

    /**
     * Registers a dependency on a declaration
     * @param depFQN FQN of the dependency (does not need to be resolved yet)
     * @param resolveFQN if set to true(default) automatically schedules resolution of the dependency FQN
     */
    public static registerDependency(localContexts: LocalContexts, depFQN: string, resolveFQN = true): void {
        const [depIndex] = localContexts.getNextContext(DependencyResolutionProcessor.DEPENDENCY_INDEX_CONTEXT) as [LCEDependency[], number];
        const [depSourceFQN] = localContexts.getNextContext(DependencyResolutionProcessor.DEPENDENCY_SOURCE_FQN_CONTEXT) as [string, number];
        const dep = new LCEDependency(depFQN, "declaration", depSourceFQN, PathUtils.isFQNModule(depSourceFQN) ? "module" : "declaration", 1);
        if (resolveFQN) {
            this.scheduleFqnResolution(localContexts, depFQN, dep);
        }
        depIndex.push(dep);
    }

    /**
     * @returns all registered dependencies of the current dependency index as a `ConceptMap`
     */
    public static getRegisteredDependencies(localContexts: LocalContexts): ConceptMap {
        return createConceptMap(
            LCEDependency.conceptId,
            (localContexts.getNextContext(DependencyResolutionProcessor.DEPENDENCY_INDEX_CONTEXT) as [LCEDependency[], number])[0]
        );
    }
}
