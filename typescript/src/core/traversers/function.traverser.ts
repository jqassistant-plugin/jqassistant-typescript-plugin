import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

/**
 * Traversal of function declarations and expressions.
 *
 * Note: see also combined use with method declarations in `MethodTraverser`
 */
export class FunctionTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";
    public static readonly BODY_PROP = "body";
    public static readonly RETURN_TYPE_PROP = "return-type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (
            node.type === AST_NODE_TYPES.FunctionDeclaration ||
            node.type === AST_NODE_TYPES.FunctionExpression ||
            node.type === AST_NODE_TYPES.TSDeclareFunction ||
            node.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression
        ) {
            if(node.typeParameters)
                runTraverserForNode(node.typeParameters, { parentPropName: FunctionTraverser.TYPE_PARAMETERS_PROP }, processingContext, processors, conceptMaps)

            runTraverserForNodes(node.params, { parentPropName: FunctionTraverser.PARAMETERS_PROP }, processingContext, processors, conceptMaps);

            if (node.body)
                runTraverserForNode(node.body, { parentPropName: FunctionTraverser.BODY_PROP }, processingContext, processors, conceptMaps);

            if(node.returnType)
                runTraverserForNode(node.returnType, { parentPropName: FunctionTraverser.RETURN_TYPE_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
