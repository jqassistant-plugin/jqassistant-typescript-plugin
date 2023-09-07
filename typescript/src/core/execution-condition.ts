import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ProcessingContext } from "./context";

/**
 * Represents the condition under which a `Processor` is executed.
 */
export class ExecutionCondition {
    /** Condition that never returns true */
    static readonly NEVER: ExecutionCondition = new ExecutionCondition([], () => false);

    /**
     * Creates new ExecutionCondition
     * @param currentNodeType 1. Check: types of the current node on which the condition shall be checked
     * @param check 2. Check: function to perform advanced checks on the global and local contexts, and on the node involving parent/sibling nodes, etc.
     */
    constructor(public currentNodeType: AST_NODE_TYPES[], public check: (processingContext: ProcessingContext) => boolean) {
    }
}
