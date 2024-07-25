import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class MethodTraverser extends Traverser {
    public static readonly KEY_PROP = "key";
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (
            node.type === AST_NODE_TYPES.MethodDefinition ||
            node.type === AST_NODE_TYPES.TSMethodSignature ||
            node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
        ) {
            if (node.type === AST_NODE_TYPES.TSMethodSignature && node.typeParameters)
                runTraverserForNodes(
                    node.typeParameters.params,
                    { parentPropName: MethodTraverser.TYPE_PARAMETERS_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );

            runTraverserForNode(node.key, { parentPropName: MethodTraverser.KEY_PROP }, processingContext, processors, conceptMaps);

            if (node.type === AST_NODE_TYPES.MethodDefinition || node.type === AST_NODE_TYPES.TSAbstractMethodDefinition) {
                runTraverserForNodes(
                    node.value.params,
                    { parentPropName: MethodTraverser.PARAMETERS_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );
                if (node.decorators)
                    runTraverserForNodes(
                        node.decorators,
                        { parentPropName: MethodTraverser.DECORATORS_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
                if (node.value.body)
                    runTraverserForNodes(
                        node.value.body.body,
                        { parentPropName: MethodTraverser.BODY_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
            } else {
                runTraverserForNodes(node.params, { parentPropName: MethodTraverser.PARAMETERS_PROP }, processingContext, processors, conceptMaps);
            }
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ParameterPropertyTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        if (node.type === AST_NODE_TYPES.TSParameterProperty && node.decorators) {
            return (
                runTraverserForNodes(
                    node.decorators,
                    {
                        parentPropName: ParameterPropertyTraverser.DECORATORS_PROP,
                    },
                    processingContext,
                    processors
                ) ?? new Map()
            );
        }

        return new Map();
    }
}
