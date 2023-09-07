import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class BlockStatementTraverser extends Traverser {
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.BlockStatement) {
            runTraverserForNodes(node.body, { parentPropName: BlockStatementTraverser.BODY_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class DoWhileStatementTraverser extends Traverser {
    public static readonly TEST_PROP = "test";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.DoWhileStatement) {
            runTraverserForNode(node.test, {parentPropName: DoWhileStatementTraverser.TEST_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.body, {parentPropName: DoWhileStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ExpressionStatementTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ExpressionStatement) {
            runTraverserForNode(
                node.expression,
                {
                    parentPropName: ExpressionStatementTraverser.EXPRESSION_PROP,
                },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ForInStatementTraverser extends Traverser {
    public static readonly LEFT_PROP = "left";
    public static readonly RIGHT_PROP = "right";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ForInStatement) {
            runTraverserForNode(node.left, {parentPropName: ForInStatementTraverser.LEFT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.right, {parentPropName: ForInStatementTraverser.RIGHT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.body, {parentPropName: ForInStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ForOfStatementTraverser extends Traverser {
    public static readonly LEFT_PROP = "left";
    public static readonly RIGHT_PROP = "right";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ForOfStatement) {
            runTraverserForNode(node.left, {parentPropName: ForOfStatementTraverser.LEFT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.right, {parentPropName: ForOfStatementTraverser.RIGHT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.body, {parentPropName: ForOfStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ForStatementTraverser extends Traverser {
    public static readonly INIT_PROP = "init";
    public static readonly TEST_PROP = "test";
    public static readonly UPDATE_PROP = "update";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ForStatement) {
            if (node.init)
                runTraverserForNode(node.init, {parentPropName: ForStatementTraverser.INIT_PROP}, processingContext, processors, conceptMaps);
            if (node.test)
                runTraverserForNode(node.test, {parentPropName: ForStatementTraverser.TEST_PROP}, processingContext, processors, conceptMaps);
            if (node.update)
                runTraverserForNode(node.update, {parentPropName: ForStatementTraverser.UPDATE_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.body, {parentPropName: ForStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class IfStatementTraverser extends Traverser {
    public static readonly TEST_PROP = "test";
    public static readonly CONSEQUENT_PROP = "consequent";
    public static readonly ALTERNATE_PROP = "alternate";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.IfStatement) {
            runTraverserForNode(node.test, {parentPropName: IfStatementTraverser.TEST_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(
                node.consequent,
                {parentPropName: IfStatementTraverser.CONSEQUENT_PROP},
                processingContext,
                processors,
                conceptMaps
            );
            if (node.alternate)
                runTraverserForNode(
                    node.alternate,
                    {parentPropName: IfStatementTraverser.ALTERNATE_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class LabeledStatementTraverser extends Traverser {
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.LabeledStatement) {
            runTraverserForNode(node.body, {parentPropName: LabeledStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ReturnStatementTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ReturnStatement) {
            if (node.argument)
                runTraverserForNode(
                    node.argument,
                    {parentPropName: ReturnStatementTraverser.ARGUMENT_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class SwitchStatementTraverser extends Traverser {
    public static readonly DISCRIMINANT_PROP = "discriminant";
    public static readonly CASES_PROP = "cases";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.SwitchStatement) {
            runTraverserForNode(
                node.discriminant,
                {parentPropName: SwitchStatementTraverser.DISCRIMINANT_PROP},
                processingContext,
                processors,
                conceptMaps
            );
            runTraverserForNodes(node.cases, {parentPropName: SwitchStatementTraverser.CASES_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class SwitchCaseTraverser extends Traverser {
    public static readonly TEST_PROP = "test";
    public static readonly CONSEQUENT_PROP = "consequent";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.SwitchCase) {
            if (node.test)
                runTraverserForNode(node.test, {parentPropName: SwitchCaseTraverser.TEST_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNodes(
                node.consequent,
                {parentPropName: SwitchCaseTraverser.CONSEQUENT_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ThrowStatementTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ThrowStatement) {
            if (node.argument)
                runTraverserForNode(
                    node.argument,
                    {parentPropName: ThrowStatementTraverser.ARGUMENT_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TryStatementTraverser extends Traverser {
    public static readonly BLOCK_PROP = "block";
    public static readonly HANDLER_PROP = "handler";
    public static readonly FINALIZER_PROP = "finalizer";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TryStatement) {
            runTraverserForNode(node.block, {parentPropName: TryStatementTraverser.BLOCK_PROP}, processingContext, processors, conceptMaps);
            if (node.handler)
                runTraverserForNode(
                    node.handler.body,
                    {parentPropName: TryStatementTraverser.HANDLER_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
            if (node.finalizer)
                runTraverserForNode(
                    node.finalizer,
                    {parentPropName: TryStatementTraverser.FINALIZER_PROP},
                    processingContext,
                    processors,
                    conceptMaps
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class WhileStatementTraverser extends Traverser {
    public static readonly TEST_PROP = "test";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.WhileStatement) {
            runTraverserForNode(node.test, {parentPropName: WhileStatementTraverser.TEST_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.body, {parentPropName: WhileStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class WithStatementTraverser extends Traverser {
    public static readonly OBJECT_PROP = "object";
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.WithStatement) {
            runTraverserForNode(node.object, {parentPropName: WithStatementTraverser.OBJECT_PROP}, processingContext, processors, conceptMaps);
            runTraverserForNode(node.body, {parentPropName: WithStatementTraverser.BODY_PROP}, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
