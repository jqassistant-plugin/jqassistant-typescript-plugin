import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNodes } from "../utils/traverser.utils";

export class TypeAliasDeclarationTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            if (node.typeParameters) {
                runTraverserForNodes(
                    node.typeParameters.params,
                    {
                        parentPropName: TypeAliasDeclarationTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            }
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
