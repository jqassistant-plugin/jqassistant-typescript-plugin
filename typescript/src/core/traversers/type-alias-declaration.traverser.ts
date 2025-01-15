import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { runTraverserForNode } from "../utils/traverser.utils";

export class TypeAliasDeclarationTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            if (node.typeParameters)
                runTraverserForNode(
                    node.typeParameters,
                    { parentPropName: TypeAliasDeclarationTraverser.TYPE_PARAMETERS_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            runTraverserForNode(
                node.typeAnnotation,
                { parentPropName: TypeAliasDeclarationTraverser.TYPE_ANNOTATION_PROP },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
