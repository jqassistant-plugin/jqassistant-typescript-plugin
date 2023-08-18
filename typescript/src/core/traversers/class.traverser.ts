import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../traverser.utils";

export class ClassTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly EXTENDS_PROP = "extends";
    public static readonly IMPLEMENTS_PROP = "implements";
    public static readonly EXTENDS_TYPE_PARAMETERS_PROP = "extends-type-parameters";
    public static readonly MEMBERS_PROP = "members";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ClassDeclaration || node.type === AST_NODE_TYPES.ClassExpression) {
            if (node.decorators) {
                runTraverserForNodes(node.decorators, { parentPropName: ClassTraverser.DECORATORS_PROP }, processingContext, processors, conceptMaps);
            }
            if (node.typeParameters) {
                runTraverserForNodes(
                    node.typeParameters.params,
                    { parentPropName: ClassTraverser.TYPE_PARAMETERS_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            }
            if (node.superClass) {
                runTraverserForNode(node.superClass, { parentPropName: ClassTraverser.EXTENDS_PROP }, processingContext, processors, conceptMaps);
            }
            if (node.implements) {
                runTraverserForNodes(node.implements, { parentPropName: ClassTraverser.IMPLEMENTS_PROP }, processingContext, processors, conceptMaps);
            }
            if (node.superTypeArguments) {
                runTraverserForNodes(
                    node.superTypeArguments.params,
                    {
                        parentPropName: ClassTraverser.EXTENDS_TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            }
            runTraverserForNodes(node.body.body, { parentPropName: ClassTraverser.MEMBERS_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class StaticBlockTraverser extends Traverser {
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.StaticBlock) {
            runTraverserForNodes(node.body, {parentPropName: StaticBlockTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
