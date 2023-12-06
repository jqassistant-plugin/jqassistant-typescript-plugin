import { ConceptMap, mergeConceptMaps, unifyConceptMap } from "./concept";
import { ProcessingContext } from "./context";
import { Processor, ProcessorMap } from "./processor";

export interface TraverserContext {
    parentPropName: string;
    parentPropIndex?: number;
}

/**
 * Used for traversing an AST.
 * Provides context for and executes processors for the current node.
 * Delegates the traversal of any child nodes.
 */
export abstract class Traverser {
    public static readonly LOCAL_TRAVERSER_CONTEXT = "~traverser";

    public traverse(traverserContext: TraverserContext, processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        // push new local context
        processingContext.localContexts.pushContexts();

        // add traverser context to local context
        processingContext.localContexts.currentContexts.set(Traverser.LOCAL_TRAVERSER_CONTEXT, traverserContext);

        // find processors for current
        const processorCandidates = processors.get(processingContext.node.type);
        let validProcessors: Processor[] = [];
        if (processorCandidates) {
            validProcessors = processorCandidates.filter((proc) => proc.executionCondition.check(processingContext));
        }

        // pre-processing
        if (validProcessors) {
            for (const proc of validProcessors) {
                proc.preChildrenProcessing(processingContext);
            }
        }

        // process children
        const childConcepts = this.traverseChildren(processingContext, processors);

        // post-processing
        const concepts: ConceptMap[] = [];
        if (validProcessors) {
            for (const proc of validProcessors) {
                concepts.push(proc.postChildrenProcessing(processingContext, childConcepts));
            }
        }

        // pop local context
        processingContext.localContexts.popContexts();

        // apply metadata assignment rules
        for(let i = processingContext.metadataAssignments.length - 1; i >= 0; i--) {
            const rule = processingContext.metadataAssignments[i];
            let applied = false;
            for(const conceptMap of concepts) {
                conceptMap.forEach((innerMap, outerKey) => {
                    innerMap.forEach((innerConcepts, innerKey) => {
                        innerConcepts.forEach(innerConcept => {
                            applied = applied || rule.apply(innerConcept);
                        });
                    });
                });
            }

            // remove rule, if it was applied at least once
            if(applied) {
                processingContext.metadataAssignments.splice(i, 1);
            }
        }

        // unify created concepts and remaining childConcepts under current parentPropName
        return unifyConceptMap(mergeConceptMaps(childConcepts, ...concepts), traverserContext.parentPropName);
    }

    public abstract traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap;
}

export class SimpleTraverser extends Traverser {
    public override traverseChildren(): ConceptMap {
        return new Map();
    }
}

export function createProcessorMap(processors: Processor[]): ProcessorMap {
    const processorMap: ProcessorMap = new Map();
    for (const proc of processors) {
        for (const nodeType of proc.executionCondition.currentNodeType) {
            const arr = processorMap.get(nodeType);
            if (arr) {
                arr.push(proc);
            } else {
                processorMap.set(nodeType, [proc]);
            }
        }
    }
    return processorMap;
}
