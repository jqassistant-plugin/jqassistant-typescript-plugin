import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap } from "../concept";
import { GlobalContext, LocalContexts } from "../context";
import { PROCESSORS } from "../features";
import { Processor } from "../processor";
import { createProcessorMap } from "../traverser";
import { runTraverserForNode } from "../utils/traverser.utils";

export class AstTraverser {
    /** optimized data structure for retrieving all processor for a specific AST node type */
    private processorMap: Map<AST_NODE_TYPES, Processor[]>;

    constructor() {
        this.processorMap = createProcessorMap(PROCESSORS);
    }

    public traverse(globalContext: GlobalContext): ConceptMap {
        const conceptMap =
            runTraverserForNode(
                globalContext.ast,
                { parentPropName: "ast" },
                {
                    globalContext: globalContext,
                    localContexts: new LocalContexts(),
                    node: globalContext.ast,
                    metadataAssignments: [],
                },
                this.processorMap,
            ) ?? new Map();

        return conceptMap;
    }
}
