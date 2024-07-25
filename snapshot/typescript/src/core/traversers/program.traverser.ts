import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNodes } from "../utils/traverser.utils";

export class ProgramTraverser extends Traverser {
    public static readonly PROGRAM_BODY_PROP = "program-body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;

        if (node.type === AST_NODE_TYPES.Program) {
            return (
                runTraverserForNodes(node.body, { parentPropName: ProgramTraverser.PROGRAM_BODY_PROP }, processingContext, processors) ?? new Map()
            );
        }

        return new Map();
    }
}
