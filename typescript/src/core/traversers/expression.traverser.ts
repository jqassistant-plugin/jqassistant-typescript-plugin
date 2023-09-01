import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class ArrayExpressionTraverser extends Traverser {
    public static readonly ELEMENTS_PROP = "elements";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ArrayExpression) {
            runTraverserForNodes(
                node.elements,
                { parentPropName: ArrayExpressionTraverser.ELEMENTS_PROP },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class SpreadElementTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.SpreadElement) {
            runTraverserForNode(node.argument, {parentPropName: SpreadElementTraverser.ARGUMENT_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ArrayPatternTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly ELEMENTS_PROP = "elements";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ArrayPattern) {
            if (node.decorators)
                runTraverserForNodes(
                    node.decorators,
                    {parentPropName: ArrayPatternTraverser.DECORATORS_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
            runTraverserForNodes(node.elements, {parentPropName: ArrayPatternTraverser.ELEMENTS_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ArrowFunctionExpressionTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
            if (node.typeParameters)
                runTraverserForNodes(
                    node.typeParameters.params,
                    {
                        parentPropName: ArrowFunctionExpressionTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
            runTraverserForNodes(
                node.params,
                {
                    parentPropName: ArrowFunctionExpressionTraverser.PARAMETERS_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
            runTraverserForNode(
                node.body,
                {parentPropName: ArrowFunctionExpressionTraverser.BODY_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class AssignmentExpressionTraverser extends Traverser {
    public static readonly LEFT_PROP = "left";
    public static readonly RIGHT_PROP = "right";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.AssignmentExpression) {
            runTraverserForNode(node.left, {parentPropName: AssignmentExpressionTraverser.LEFT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.right, {parentPropName: AssignmentExpressionTraverser.RIGHT_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class AwaitExpressionTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.AwaitExpression) {
            runTraverserForNode(
                node.argument,
                {parentPropName: AwaitExpressionTraverser.ARGUMENT_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class BinaryExpressionTraverser extends Traverser {
    public static readonly LEFT_PROP = "left";
    public static readonly RIGHT_PROP = "right";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.BinaryExpression) {
            runTraverserForNode(node.left, {parentPropName: BinaryExpressionTraverser.LEFT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.right, {parentPropName: BinaryExpressionTraverser.RIGHT_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class CallExpressionTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly ARGUMENTS_PROP = "arguments";
    public static readonly CALLEE_PROP = "callee";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.CallExpression) {
            if (node.typeArguments)
                runTraverserForNodes(
                    node.typeArguments.params,
                    {
                        parentPropName: CallExpressionTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
            runTraverserForNodes(
                node.arguments,
                {parentPropName: CallExpressionTraverser.ARGUMENTS_PROP},
                processingContext,
                processors,
                conceptMaps
            );
            runTraverserForNode(node.callee, {parentPropName: CallExpressionTraverser.CALLEE_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ChainExpressionTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ChainExpression) {
            runTraverserForNode(
                node.expression,
                {parentPropName: ChainExpressionTraverser.EXPRESSION_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ConditionalExpressionTraverser extends Traverser {
    public static readonly TEST_PROP = "test";
    public static readonly CONSEQUENT_PROP = "consequent";
    public static readonly ALTERNATE_PROP = "alternate";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ConditionalExpression) {
            runTraverserForNode(node.test, {parentPropName: ConditionalExpressionTraverser.TEST_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(
                node.consequent,
                {
                    parentPropName: ConditionalExpressionTraverser.CONSEQUENT_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
            runTraverserForNode(
                node.alternate,
                {
                    parentPropName: ConditionalExpressionTraverser.ALTERNATE_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class IdentifierTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly TYPE_ANNOTATIONS_PROP = "type-annotations";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.Identifier) {
            if (node.decorators)
                runTraverserForNodes(
                    node.decorators,
                    {parentPropName: IdentifierTraverser.DECORATORS_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
            if (node.typeAnnotation)
                runTraverserForNode(
                    node.typeAnnotation,
                    {
                        parentPropName: IdentifierTraverser.TYPE_ANNOTATIONS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ImportExpressionTraverser extends Traverser {
    public static readonly ATTRIBUTES_PROP = "attributes";
    public static readonly SOURCE_PROP = "source";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ImportExpression) {
            runTraverserForNode(node.source, {parentPropName: ImportExpressionTraverser.SOURCE_PROP}, processingContext, processors, conceptMaps);
            if (node.attributes)
                runTraverserForNode(
                    node.attributes,
                    {
                        parentPropName: ImportExpressionTraverser.ATTRIBUTES_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class LogicalExpressionTraverser extends Traverser {
    public static readonly LEFT_PROP = "left";
    public static readonly RIGHT_PROP = "right";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.LogicalExpression) {
            runTraverserForNode(node.left, {parentPropName: LogicalExpressionTraverser.LEFT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.right, {parentPropName: LogicalExpressionTraverser.RIGHT_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class MemberExpressionTraverser extends Traverser {
    public static readonly OBJECT_PROP = "object";
    public static readonly PROPERTY_PROP = "property";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.MemberExpression) {
            runTraverserForNode(node.object, {parentPropName: MemberExpressionTraverser.OBJECT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(
                node.property,
                {parentPropName: MemberExpressionTraverser.PROPERTY_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class NewExpressionTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly ARGUMENTS_PROP = "arguments";
    public static readonly CALLEE_PROP = "callee";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.NewExpression) {
            if (node.typeArguments)
                runTraverserForNodes(
                    node.typeArguments.params,
                    {
                        parentPropName: NewExpressionTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
            runTraverserForNodes(
                node.arguments,
                {parentPropName: NewExpressionTraverser.ARGUMENTS_PROP},
                processingContext,
                processors,
                conceptMaps
            );
            runTraverserForNode(node.callee, {parentPropName: NewExpressionTraverser.CALLEE_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ObjectExpressionTraverser extends Traverser {
    public static readonly PROPERTIES_PROP = "properties";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ObjectExpression) {
            runTraverserForNodes(
                node.properties,
                {parentPropName: ObjectExpressionTraverser.PROPERTIES_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ObjectPatternTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly PROPERTIES_PROP = "properties";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ObjectPattern) {
            if (node.decorators)
                runTraverserForNodes(
                    node.decorators,
                    {parentPropName: ObjectPatternTraverser.DECORATORS_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
            runTraverserForNodes(
                node.properties,
                {parentPropName: ObjectPatternTraverser.PROPERTIES_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class SequenceExpressionTraverser extends Traverser {
    public static readonly EXPRESSIONS_PROP = "expressions";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.SequenceExpression) {
            runTraverserForNodes(
                node.expressions,
                {
                    parentPropName: SequenceExpressionTraverser.EXPRESSIONS_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TaggedTemplateExpressionTraverser extends Traverser {
    public static readonly QUASI_PROP = "quasi";
    public static readonly TAG_PROP = "tag";
    public static readonly TYPE_PARAMETER_PROP = "type-parameters";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
            if (node.typeArguments)
                runTraverserForNodes(
                    node.typeArguments.params,
                    {
                        parentPropName: TaggedTemplateExpressionTraverser.TYPE_PARAMETER_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
            runTraverserForNode(node.tag, {parentPropName: TaggedTemplateExpressionTraverser.TAG_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(
                node.quasi,
                {
                    parentPropName: TaggedTemplateExpressionTraverser.QUASI_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TemplateLiteralTraverser extends Traverser {
    public static readonly QUASIS_PROP = "quasis";
    public static readonly EXPRESSIONS_PROP = "expressions";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TemplateLiteral) {
            runTraverserForNodes(node.quasis, {parentPropName: TemplateLiteralTraverser.QUASIS_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNodes(
                node.expressions,
                {parentPropName: TemplateLiteralTraverser.EXPRESSIONS_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class AsExpressionTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSAsExpression) {
            runTraverserForNode(
                node.expression,
                {parentPropName: AsExpressionTraverser.EXPRESSION_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class NonNullExpressionTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSNonNullExpression) {
            if (node.expression)
                runTraverserForNode(
                    node.expression,
                    {
                        parentPropName: NonNullExpressionTraverser.EXPRESSION_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypeAssertionTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeAssertion) {
            runTraverserForNode(
                node.expression,
                {parentPropName: TypeAssertionTraverser.EXPRESSION_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class UnaryExpressionTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.UnaryExpression) {
            runTraverserForNode(
                node.argument,
                {parentPropName: UnaryExpressionTraverser.ARGUMENT_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class UpdateExpressionTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.UpdateExpression) {
            runTraverserForNode(
                node.argument,
                {parentPropName: UpdateExpressionTraverser.ARGUMENT_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class YieldExpressionTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.YieldExpression) {
            if (node.argument)
                runTraverserForNode(
                    node.argument,
                    {parentPropName: YieldExpressionTraverser.ARGUMENT_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
