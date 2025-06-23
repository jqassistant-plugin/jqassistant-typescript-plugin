import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEDecorator } from "../concepts/decorator.concept";
import { LCEFunctionDeclaration } from "../concepts/function-declaration.concept";
import { LCEParameterDeclaration } from "../concepts/method-declaration.concept";
import { LCETypeParameterDeclaration } from "../concepts/type-parameter.concept";
import { LCETypeFunction } from "../concepts/type.concept";
import { FQN, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteChildConcepts, getParentPropIndex } from "../utils/processor.utils";
import { IdentifierTraverser } from "../traversers/expression.traverser";
import { FunctionTraverser } from "../traversers/function.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseFunctionType } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";
import { CoreContextKeys } from "../context.keys";

/**
 * Extracts concepts for globally declared functions.
 *
 * Note: Nested functions are not processed.
 */
export class FunctionDeclarationProcessor extends Processor {

    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.FunctionDeclaration, AST_NODE_TYPES.TSDeclareFunction, AST_NODE_TYPES.ArrowFunctionExpression],
        ({ node }) => {
            return (
                !!node.parent &&
                (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                    node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                    node.parent.type === AST_NODE_TYPES.Program)
            );
        },
    );

    public override preChildrenProcessing({ node, localContexts, globalContext, ...unusedProcessingContext }: ProcessingContext): void {
        if (
            node.type === AST_NODE_TYPES.FunctionDeclaration ||
            node.type === AST_NODE_TYPES.TSDeclareFunction ||
            node.type === AST_NODE_TYPES.ArrowFunctionExpression
        ) {
            const fqnIdentifier = DependencyResolutionProcessor.isDefaultDeclaration(localContexts, node, node.id?.name) ? "default" : node.id?.name;
            if (fqnIdentifier) {
                DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(fqnIdentifier));
                DependencyResolutionProcessor.createDependencyIndex(localContexts);
            }

            const functionType = parseFunctionType({ localContexts, node, globalContext, ...unusedProcessingContext }, node);
            if (functionType) {
                localContexts.currentContexts.set(CoreContextKeys.FUNCTION_TYPE, functionType);
                if (fqnIdentifier) {
                    const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
                    let id = DependencyResolutionProcessor.constructDeclarationIdentifier(localContexts, node, node.id?.name);
                    DependencyResolutionProcessor.registerDeclaration(localContexts, id, fqn, true);
                }
            }
        }
    }

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (
            node.type === AST_NODE_TYPES.FunctionDeclaration ||
            node.type === AST_NODE_TYPES.TSDeclareFunction ||
            node.type === AST_NODE_TYPES.ArrowFunctionExpression
        ) {
            // TODO: handle overloads
            const functionType = localContexts.currentContexts.get(CoreContextKeys.FUNCTION_TYPE) as
                | LCETypeFunction
                | undefined;
            if (functionType) {
                const functionName = DependencyResolutionProcessor.constructDeclarationIdentifier(localContexts, node, node.id?.name);
                const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
                const typeParameters: LCETypeParameterDeclaration[] = functionType.typeParameters;
                const returnType = functionType.returnType;
                return mergeConceptMaps(
                    singleEntryConceptMap(
                        LCEFunctionDeclaration.conceptId,
                        new LCEFunctionDeclaration(
                            functionName,
                            fqn,
                            getAndDeleteChildConcepts(FunctionTraverser.PARAMETERS_PROP, LCEParameterDeclaration.conceptId, childConcepts),
                            returnType,
                            functionType.async,
                            typeParameters,
                            CodeCoordinateUtils.getCodeCoordinates(globalContext, node, true),
                        ),
                    ),
                    DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
                );
            }
        }
        return new Map();
    }
}

/**
 * Extracts concepts for functions parameters of functions that are processed by the `FunctionDeclarationProcessor`
 */
export class FunctionParameterProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Identifier, AST_NODE_TYPES.ObjectPattern], // TODO: add other parameter patterns
        ({localContexts}) =>
            !!localContexts.parentContexts && localContexts.parentContexts.has(CoreContextKeys.FUNCTION_TYPE)
    );

    public override postChildrenProcessing({
                                               node,
                                               localContexts,
                                               globalContext
                                           }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (localContexts.parentContexts) {
            const functionType = localContexts.parentContexts.get(CoreContextKeys.FUNCTION_TYPE) as LCETypeFunction;
            if (functionType) {
                const paramIndex = getParentPropIndex(localContexts);
                if (paramIndex !== undefined) {
                    const funcTypeParam = functionType.parameters[paramIndex];

                    // TODO: handle function overloads: funcTypeParam must always be defined!
                    if (funcTypeParam) {
                        const paramName = node.type === AST_NODE_TYPES.Identifier ? funcTypeParam.name : "";
                        return singleEntryConceptMap(
                            LCEParameterDeclaration.conceptId,
                            new LCEParameterDeclaration(
                                funcTypeParam.index,
                                paramName,
                                funcTypeParam.type,
                                "optional" in node && !!node.optional,
                                getAndDeleteChildConcepts(IdentifierTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts),
                                CodeCoordinateUtils.getCodeCoordinates(globalContext, node)
                            )
                        );
                    }
                }
            }
        }

        return new Map();
    }
}
