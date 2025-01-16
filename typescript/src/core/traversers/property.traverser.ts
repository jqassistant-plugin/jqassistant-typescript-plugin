import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class PropertyTraverser extends Traverser {
    public static readonly KEY_PROP = "key";
    public static readonly INITIALIZER_PROP = "initializer";
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (
            node.type === AST_NODE_TYPES.PropertyDefinition ||
            node.type === AST_NODE_TYPES.Property ||
            node.type === AST_NODE_TYPES.TSPropertySignature
        ) {
            runTraverserForNode(node.key, { parentPropName: PropertyTraverser.KEY_PROP }, processingContext, processors, conceptMaps);

            if (node.type === AST_NODE_TYPES.PropertyDefinition || node.type === AST_NODE_TYPES.TSPropertySignature) {
                if (node.typeAnnotation)
                    runTraverserForNode(
                        node.typeAnnotation,
                        { parentPropName: PropertyTraverser.TYPE_ANNOTATION_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
            }

            if (node.type === AST_NODE_TYPES.PropertyDefinition || node.type === AST_NODE_TYPES.Property) {
                if (node.value)
                    runTraverserForNode(
                        node.value,
                        { parentPropName: PropertyTraverser.INITIALIZER_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
                if (node.type === AST_NODE_TYPES.PropertyDefinition && node.decorators)
                    runTraverserForNodes(
                        node.decorators,
                        { parentPropName: PropertyTraverser.DECORATORS_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
            }
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class AccessorPropertyTraverser extends Traverser {
    public static readonly KEY_PROP = "key";
    public static readonly INITIALIZER_PROP = "initializer";
    public static readonly DECORATORS_PROP = "decorators";

    traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.AccessorProperty || node.type === AST_NODE_TYPES.TSAbstractAccessorProperty) {
            runTraverserForNode(node.key, { parentPropName: AccessorPropertyTraverser.KEY_PROP }, processingContext, processors, conceptMaps);

            if (node.value)
                runTraverserForNode(
                    node.value,
                    { parentPropName: AccessorPropertyTraverser.INITIALIZER_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );

            if (node.decorators)
                runTraverserForNodes(
                    node.decorators,
                    { parentPropName: AccessorPropertyTraverser.DECORATORS_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
