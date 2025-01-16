import { Processor } from "../processor";
import { ExecutionCondition } from "../execution-condition";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { ConceptMap, singleEntryConceptMap } from "../concept";
import { LCEIndexAccessTypeAnnotation } from "../concepts/type-annotation.concept";
import { ProcessingContext } from "../context";
import { getAndDeleteChildConcepts } from "../utils/processor.utils";
import { ProgramTraverser } from "../traversers/program.traverser";


/**
 * Creates marker concepts for the usage of indexed access types in type annotations. (see `LCEIndexAccessTypeAnnotation`)
 */
export class IndexedAccessTypeProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.TSIndexedAccessType], () => true);

    override postChildrenProcessing({ node, localContexts, ...unusedProcessingContext }: ProcessingContext): ConceptMap {
        return singleEntryConceptMap(LCEIndexAccessTypeAnnotation.conceptId, new LCEIndexAccessTypeAnnotation());
    }
}

/**
 * Cleans up any non-deleted IndexAccessTypeAnnotation concepts, so that they don't get exported to the final result.
 */
export class IndexedAccessTypeCleanupProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Program], () => true);

    override postChildrenProcessing({ node, localContexts, ...unusedProcessingContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        getAndDeleteChildConcepts(ProgramTraverser.PROGRAM_BODY_PROP, LCEIndexAccessTypeAnnotation.conceptId, childConcepts);
        return new Map();
    }
}


