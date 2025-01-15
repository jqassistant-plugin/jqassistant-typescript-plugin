import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode } from "../utils/traverser.utils";

export class DecoratorTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.Decorator) {
            runTraverserForNode(node.expression, { parentPropName: DecoratorTraverser.EXPRESSION_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
