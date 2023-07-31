import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {ConceptMap} from "../concept";
import {ProcessingContext} from "../context";
import {ProcessorMap} from "../processor";
import {Traverser} from "../traverser";
import {runTraverserForNode} from "../traverser.utils";

export class DecoratorTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;

        if (node.type === AST_NODE_TYPES.Decorator) {
            return (
                runTraverserForNode(node.expression, {parentPropName: DecoratorTraverser.EXPRESSION_PROP}, processingContext, processors) ??
                new Map()
            );
        }

        return new Map();
    }
}
