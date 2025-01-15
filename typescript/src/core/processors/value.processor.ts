import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, singleEntryConceptMap } from "../concept";
import { LCEType } from "../concepts/type.concept";
import {
    LCEValue,
    LCEValueArray,
    LCEValueCall,
    LCEValueClass,
    LCEValueComplex,
    LCEValueDeclared,
    LCEValueFunction,
    LCEValueLiteral,
    LCEValueMember,
    LCEValueNull,
    LCEValueObject,
    LCEValueObjectProperty,
} from "../concepts/value.concept";
import { FQN, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteAllValueChildConcepts, getAndDeleteChildConcepts, getParentPropName } from "../utils/processor.utils";
import {
    ArrayExpressionTraverser,
    CallExpressionTraverser,
    MemberExpressionTraverser,
    ObjectExpressionTraverser,
} from "../traversers/expression.traverser";
import { PropertyTraverser } from "../traversers/property.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseESNodeType } from "./type.utils";
import { VariableDeclaratorProcessor } from "./variable-declaration.processor";
import { CoreContextKeys } from "../context.keys";

export class LiteralValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Literal], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override postChildrenProcessing({ node }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.Literal) {
            if (node.value === null) {
                return singleEntryConceptMap(LCEValueNull.conceptId, new LCEValueNull("null"));
            } else {
                return singleEntryConceptMap(LCEValueLiteral.conceptId, new LCEValueLiteral(node.value));
            }
        }
        return new Map();
    }
}

export class IdentifierValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Identifier], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override postChildrenProcessing({ node, localContexts, ...unusedProcessingContext }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.Identifier) {
            if (node.name === "undefined") {
                return singleEntryConceptMap(LCEValueNull.conceptId, new LCEValueNull("undefined"));
            } else {
                const declaredValue = new LCEValueDeclared(
                    parseESNodeType(
                        {
                            node,
                            localContexts,
                            ...unusedProcessingContext,
                        },
                        node,
                        node.name,
                        true,
                    ),
                    new FQN(node.name),
                );
                const resolve = localContexts.parentContexts?.get(CoreContextKeys.DO_NOT_RESOLVE_IDENTIFIER_FLAG) as number | undefined;

                if (resolve === undefined || (resolve === 0 && getParentPropName(localContexts) === MemberExpressionTraverser.OBJECT_PROP)) {
                    DependencyResolutionProcessor.scheduleFqnResolution(localContexts, node.name, declaredValue);
                }

                return singleEntryConceptMap(LCEValueDeclared.conceptId, declaredValue);
            }
        }
        return new Map();
    }
}

export class MemberValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.MemberExpression], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override preChildrenProcessing({ localContexts }: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
        if (localContexts.parentContexts?.has(CoreContextKeys.DO_NOT_RESOLVE_IDENTIFIER_FLAG)) {
            localContexts.currentContexts.set(
                CoreContextKeys.DO_NOT_RESOLVE_IDENTIFIER_FLAG,
                (localContexts.parentContexts?.get(CoreContextKeys.DO_NOT_RESOLVE_IDENTIFIER_FLAG) as number) + 1,
            );
        } else {
            localContexts.currentContexts.set(CoreContextKeys.DO_NOT_RESOLVE_IDENTIFIER_FLAG, 0);
        }
    }

    public override postChildrenProcessing({ node }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (
            node.type === AST_NODE_TYPES.MemberExpression &&
            childConcepts.has(MemberExpressionTraverser.OBJECT_PROP) &&
            childConcepts.has(MemberExpressionTraverser.PROPERTY_PROP)
        ) {
            const objects = getAndDeleteAllValueChildConcepts(MemberExpressionTraverser.OBJECT_PROP, childConcepts);
            const properties = getAndDeleteAllValueChildConcepts(MemberExpressionTraverser.PROPERTY_PROP, childConcepts);
            if (node.computed) {
                // TODO: handled computed member expressions
                return singleEntryConceptMap(LCEValueComplex.conceptId, new LCEValueComplex("computed member expression"));
            }
            if (objects.length === 1 && properties.length === 1) {
                return singleEntryConceptMap(LCEValueMember.conceptId, new LCEValueMember(properties[0].type, objects[0], properties[0]));
            }
        }
        return new Map();
    }
}

export class ObjectValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ObjectExpression], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override preChildrenProcessing({ localContexts }: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
    }

    public override postChildrenProcessing(
        { node, localContexts, ...unusedProcessingContext }: ProcessingContext,
        childConcepts: ConceptMap,
    ): ConceptMap {
        if (node.type === AST_NODE_TYPES.ObjectExpression) {
            const properties: LCEValueObjectProperty[] = getAndDeleteChildConcepts(
                ObjectExpressionTraverser.PROPERTIES_PROP,
                LCEValueObjectProperty.conceptId,
                childConcepts,
            );
            const variableDeclarationFQN = localContexts.getNextContext(VariableDeclaratorProcessor.VARIABLE_DECLARATOR_FQN_CONTEXT) as
                | [string, number]
                | undefined;
            const type = parseESNodeType({ node, localContexts, ...unusedProcessingContext }, node, variableDeclarationFQN?.[0]);
            return singleEntryConceptMap(
                LCEValueObject.conceptId,
                new LCEValueObject(type, new Map(properties.map((prop) => [prop.name, prop.value]))),
            );
        }
        return new Map();
    }
}

export class ObjectValuePropertyProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Property], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override preChildrenProcessing({ localContexts }: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
    }

    public override postChildrenProcessing({ node }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.Property) {
            getAndDeleteAllValueChildConcepts(PropertyTraverser.KEY_PROP, childConcepts);
            const properties = getAndDeleteAllValueChildConcepts(PropertyTraverser.INITIALIZER_PROP, childConcepts);
            if (node.key.type === AST_NODE_TYPES.Identifier && properties.length === 1) {
                return singleEntryConceptMap(LCEValueObjectProperty.conceptId, new LCEValueObjectProperty(node.key.name, properties[0]));
            }
        }
        return new Map();
    }
}

export class ArrayValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ArrayExpression], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override preChildrenProcessing({ localContexts }: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
    }

    public override postChildrenProcessing({ node, ...unusedProcessingContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.ArrayExpression) {
            const elements: LCEValue[] = getAndDeleteAllValueChildConcepts(ArrayExpressionTraverser.ELEMENTS_PROP, childConcepts);
            return singleEntryConceptMap(
                LCEValueArray.conceptId,
                new LCEValueArray(parseESNodeType({ node, ...unusedProcessingContext }, node), elements),
            );
        }
        return new Map();
    }
}

export class CallValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.CallExpression], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override preChildrenProcessing({ localContexts }: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
    }

    public override postChildrenProcessing({ node, ...unusedProcessingContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            const callee: LCEValue[] = getAndDeleteAllValueChildConcepts(CallExpressionTraverser.CALLEE_PROP, childConcepts);
            const args: LCEValue[] = getAndDeleteAllValueChildConcepts(CallExpressionTraverser.ARGUMENTS_PROP, childConcepts);

            return singleEntryConceptMap(
                LCEValueCall.conceptId,
                new LCEValueCall(
                    parseESNodeType({ node, ...unusedProcessingContext }, node),
                    callee[0],
                    args,
                    node.typeArguments?.params.map((param) =>
                        parseESNodeType(
                            {
                                node: param,
                                ...unusedProcessingContext,
                            },
                            param,
                        ),
                    ) ?? [],
                ),
            );
        }
        return new Map();
    }
}

export class FunctionValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.FunctionExpression, AST_NODE_TYPES.ArrowFunctionExpression],
        ({ localContexts }) => {
            return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
        },
    );

    public override postChildrenProcessing({ node, ...unusedProcessingContext }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.FunctionExpression || node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
            let type: LCEType;
            if (node.parent && node.parent.type === AST_NODE_TYPES.VariableDeclarator && node.parent.id.type === AST_NODE_TYPES.Identifier) {
                type = parseESNodeType({ node, ...unusedProcessingContext }, node, node.parent.id.name);
            } else {
                type = parseESNodeType({ node, ...unusedProcessingContext }, node);
            }
            return singleEntryConceptMap(
                LCEValueFunction.conceptId,
                new LCEValueFunction(type, node.type === AST_NODE_TYPES.ArrowFunctionExpression),
            );
        }
        return new Map();
    }
}

export class ClassValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ClassExpression], ({ localContexts }) => {
        return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
    });

    public override postChildrenProcessing({ node }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.ClassExpression) {
            // TODO: add proper class value
            return singleEntryConceptMap(LCEValueClass.conceptId, new LCEValueClass());
        }
        return new Map();
    }
}

export class ComplexValueProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [
            AST_NODE_TYPES.SpreadElement,
            AST_NODE_TYPES.ArrayPattern,
            AST_NODE_TYPES.AssignmentExpression,
            AST_NODE_TYPES.AwaitExpression,
            AST_NODE_TYPES.BinaryExpression,
            AST_NODE_TYPES.ChainExpression,
            AST_NODE_TYPES.ConditionalExpression,
            AST_NODE_TYPES.ImportExpression,
            AST_NODE_TYPES.LogicalExpression,
            AST_NODE_TYPES.NewExpression,
            AST_NODE_TYPES.ObjectPattern,
            AST_NODE_TYPES.SequenceExpression,
            AST_NODE_TYPES.TaggedTemplateExpression,
            AST_NODE_TYPES.TemplateLiteral,
            AST_NODE_TYPES.TSAsExpression,
            AST_NODE_TYPES.TSNonNullExpression,
            AST_NODE_TYPES.TSTypeAssertion,
            AST_NODE_TYPES.UnaryExpression,
            AST_NODE_TYPES.UpdateExpression,
            AST_NODE_TYPES.YieldExpression,
        ],
        ({ localContexts }) => {
            return !!localContexts.parentContexts?.has(CoreContextKeys.VALUE_PROCESSING_FLAG);
        },
    );

    public override postChildrenProcessing({ node, globalContext }: ProcessingContext): ConceptMap {
        return singleEntryConceptMap(
            LCEValueComplex.conceptId,
            new LCEValueComplex(globalContext.services.esTreeNodeToTSNodeMap.get(node).getText()),
        );
    }
}
