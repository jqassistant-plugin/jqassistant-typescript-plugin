import { ConceptMap, mergeConceptMaps } from "./concept";
import { ProcessingContext } from "./context";
import { Processor, ProcessorMap } from "./processor";
import { CoreContextKeys } from "./context.keys";
import {debugTraversalStack} from "./utils/log.utils";

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
    public traverse(traverserContext: TraverserContext, processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        // push new local context
        processingContext.localContexts.pushContexts();

        // add traverser context to local context
        processingContext.localContexts.currentContexts.set(CoreContextKeys.TRAVERSER_CONTEXT, traverserContext);

        // find matching processors for current context
        const processorCandidates = processors.get(processingContext.node.type);
        let validProcessors: Processor[] = [];
        if (processorCandidates) {
            validProcessors = processorCandidates.filter((proc) => proc.executionCondition.check(processingContext));
        }

        debugTraversalStack(processingContext.localContexts);

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
        for (let i = processingContext.metadataAssignments.length - 1; i >= 0; i--) {
            const rule = processingContext.metadataAssignments[i];
            let applied = false;
            for (const conceptMap of concepts) {
                conceptMap.forEach((innerMap) => {
                    innerMap.forEach((innerConcepts) => {
                        innerConcepts.forEach((innerConcept) => {
                            applied = applied || rule.apply(innerConcept);
                        });
                    });
                });
            }

            // remove rule, if it was applied at least once
            if (applied) {
                processingContext.metadataAssignments.splice(i, 1);
            }
        }

        // merge newly created concepts and remaining childConcepts
        return mergeConceptMaps(childConcepts, ...concepts);
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
