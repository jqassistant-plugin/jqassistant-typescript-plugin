/* eslint-disable @typescript-eslint/no-unused-vars */
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap } from "./concept";
import { ProcessingContext } from "./context";
import { ExecutionCondition } from "./execution-condition";

export type ProcessorMap = Map<AST_NODE_TYPES, Processor[]>;

/**
 * Extracts language concepts from a given node of an AST and its children.
 */
export abstract class Processor {
    /**
     * defines on what nodes and in which context the processor is executed
     */
    public abstract executionCondition: ExecutionCondition;

    /**
     * Function that is executed before the children of the current AST node are processed.
     * Use to set up the local context.
     */
    public preChildrenProcessing(processingContext: ProcessingContext): void {
        return;
    }

    /**
     * Function that is executed after the children of the current AST node have been processed.
     * Use to integrate concepts generated for child nodes.
     *
     * NOTE: Remove child concepts from the Map, if they are no longer needed further up the tree!
     *
     * @returns new concept(s) created for the current node
     */
    public postChildrenProcessing(processingContext: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        return new Map();
    }
}
