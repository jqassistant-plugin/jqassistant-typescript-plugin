import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {ConceptMap, mergeConceptMaps} from "../concept";
import {ProcessingContext} from "../context";
import {ProcessorMap} from "../processor";
import {Traverser} from "../traverser";
import {runTraverserForNodes} from "../traverser.utils";

export class FunctionTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (
            node.type === AST_NODE_TYPES.FunctionDeclaration ||
            node.type === AST_NODE_TYPES.FunctionExpression ||
            node.type === AST_NODE_TYPES.TSDeclareFunction
        ) {
            if (node.typeParameters) {
                runTraverserForNodes(
                    node.typeParameters.params,
                    {parentPropName: FunctionTraverser.TYPE_PARAMETERS_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
            }
            runTraverserForNodes(node.params, {parentPropName: FunctionTraverser.PARAMETERS_PROP}, processingContext, processors, conceptMaps);
            if (node.body)
                runTraverserForNodes(node.body.body, {parentPropName: FunctionTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
