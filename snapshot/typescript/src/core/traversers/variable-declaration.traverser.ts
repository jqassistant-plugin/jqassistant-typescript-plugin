import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class VariableDeclarationTraverser extends Traverser {
    public static readonly DECLARATIONS_PROP = "declarations";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.VariableDeclaration) {
            runTraverserForNodes(
                node.declarations,
                {
                    parentPropName: VariableDeclarationTraverser.DECLARATIONS_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class VariableDeclaratorTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly INIT_PROP = "init";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.VariableDeclarator) {
            if (node.id.decorators)
                runTraverserForNodes(
                    node.id.decorators,
                    {
                        parentPropName: VariableDeclaratorTraverser.DECORATORS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
            if (node.init)
                runTraverserForNode(node.init, {parentPropName: VariableDeclaratorTraverser.INIT_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
