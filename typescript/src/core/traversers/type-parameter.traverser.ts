import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class TypeParameterDeclarationTraverser extends Traverser {
    public static readonly PARAMS_PROP = "params";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeParameterDeclaration) {
            runTraverserForNodes(
                node.params,
                {
                    parentPropName: TypeParameterDeclarationTraverser.PARAMS_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypeParameterInstantiationTraverser extends Traverser {
    public static readonly PARAMS_PROP = "params";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeParameterInstantiation) {
            runTraverserForNodes(
                node.params,
                {
                    parentPropName: TypeParameterInstantiationTraverser.PARAMS_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypeParameterTraverser extends Traverser {
    public static readonly CONSTRAINT_PROP = "constraint";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;

        if (node.type === AST_NODE_TYPES.TSTypeParameter) {
            if (node.constraint)
                return (
                    runTraverserForNode(
                        node.constraint,
                        {
                            parentPropName: TypeParameterTraverser.CONSTRAINT_PROP,
                        },
                        processingContext,
                        processors
                    ) ?? new Map()
                );
        }

        return new Map();
    }
}
