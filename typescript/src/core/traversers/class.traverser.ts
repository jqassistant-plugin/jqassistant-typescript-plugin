import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

/**
 * Traversal of class declaration and class expressions
 *
 * Note that this Traverser mainly delegates to Traversers that handle "class signature" constructs like decorators, inheritance, or type parameters.
 * The traversal of the actual class members is handled one level below via the `ClassBodyTraverser`
 */
export class ClassTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly EXTENDS_PROP = "extends";
    public static readonly IMPLEMENTS_PROP = "implements";
    public static readonly EXTENDS_TYPE_PARAMETERS_PROP = "extends-type-parameters";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ClassDeclaration || node.type === AST_NODE_TYPES.ClassExpression) {
            if (node.decorators) {
                runTraverserForNodes(node.decorators, { parentPropName: ClassTraverser.DECORATORS_PROP }, processingContext, processors, conceptMaps);
            }
            if (node.typeParameters) {
                runTraverserForNodes(
                    node.typeParameters.params, // TODO: remove direct hoisting
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
            runTraverserForNode(node.body, { parentPropName: ClassTraverser.BODY_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

/**
 * Traversal of the members of a class declaration/expression
 */
export class ClassBodyTraverser extends Traverser {
    public static readonly MEMBERS_PROP = "members";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ClassBody) {
            runTraverserForNodes(node.body, { parentPropName: ClassBodyTraverser.MEMBERS_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

/**
 * Traversal of static blocks of a class declaration/expression that are part of the class body (see `ClassBodyTraverser`)
 */
export class StaticBlockTraverser extends Traverser {
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.StaticBlock) {
            runTraverserForNodes(node.body, { parentPropName: StaticBlockTraverser.BODY_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
