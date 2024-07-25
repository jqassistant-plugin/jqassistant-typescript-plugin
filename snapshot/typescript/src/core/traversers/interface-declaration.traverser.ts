import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class InterfaceDeclarationTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly EXTENDS_PROP = "extends";
    public static readonly MEMBERS_PROP = "members";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
            if (node.typeParameters) {
                runTraverserForNodes(
                    node.typeParameters.params,
                    {
                        parentPropName: InterfaceDeclarationTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            }
            if (node.extends) {
                runTraverserForNodes(
                    node.extends,
                    {
                        parentPropName: InterfaceDeclarationTraverser.EXTENDS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            }
            runTraverserForNodes(
                node.body.body,
                { parentPropName: InterfaceDeclarationTraverser.MEMBERS_PROP },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class InterfaceHeritageTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSInterfaceHeritage) {
            if (node.typeArguments) {
                runTraverserForNodes(
                    node.typeArguments.params,
                    {
                        parentPropName: InterfaceHeritageTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
            }
            runTraverserForNode(
                node.expression,
                {parentPropName: InterfaceHeritageTraverser.EXPRESSION_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
