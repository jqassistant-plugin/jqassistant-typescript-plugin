import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEDecorator } from "../concepts/decorator.concept";
import { LCEFunctionDeclaration } from "../concepts/function-declaration.concept";
import { LCEParameterDeclaration } from "../concepts/method-declaration.concept";
import { LCETypeParameterDeclaration } from "../concepts/type-parameter.concept";
import { LCETypeFunction } from "../concepts/type.concept";
import { ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteChildConcepts, getParentPropIndex } from "../utils/processor.utils";
import { IdentifierTraverser } from "../traversers/expression.traverser";
import { FunctionTraverser } from "../traversers/function.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseFunctionType } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";

export class FunctionDeclarationProcessor extends Processor {
    /** is used to provide an LCETypeFunction object of the currently traversed function */
    public static readonly FUNCTION_TYPE_CONTEXT_ID = "function-type";

    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.FunctionDeclaration, AST_NODE_TYPES.TSDeclareFunction],
        ({ node }) => {
            return (
                !!node.parent &&
                (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                    node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                    node.parent.type === AST_NODE_TYPES.Program)
            );
        },
    );

    public override preChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.FunctionDeclaration || node.type === AST_NODE_TYPES.TSDeclareFunction) {
            if (node.id) {
                DependencyResolutionProcessor.addScopeContext(localContexts, node.id.name);
                DependencyResolutionProcessor.createDependencyIndex(localContexts);
            }

            const functionType = parseFunctionType({ globalContext, localContexts, node }, node);
            if (functionType) {
                localContexts.currentContexts.set(FunctionDeclarationProcessor.FUNCTION_TYPE_CONTEXT_ID, functionType);
                if (node.id) {
                    const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
                    DependencyResolutionProcessor.registerDeclaration(localContexts, node.id.name, fqn, true);
                }
            }
        }
    }

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.FunctionDeclaration || node.type === AST_NODE_TYPES.TSDeclareFunction) {
            // TODO: handle overloads
            const functionType = localContexts.currentContexts.get(FunctionDeclarationProcessor.FUNCTION_TYPE_CONTEXT_ID) as
                | LCETypeFunction
                | undefined;
            if (functionType) {
                const functionName = node.id?.name ?? "";
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

export class FunctionParameterProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Identifier], // TODO: add other parameter patterns
        ({localContexts}) =>
            !!localContexts.parentContexts && localContexts.parentContexts.has(FunctionDeclarationProcessor.FUNCTION_TYPE_CONTEXT_ID)
    );

    public override postChildrenProcessing({
                                               node,
                                               localContexts,
                                               globalContext
                                           }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (localContexts.parentContexts) {
            const functionType = localContexts.parentContexts.get(FunctionDeclarationProcessor.FUNCTION_TYPE_CONTEXT_ID) as LCETypeFunction;
            if (functionType) {
                const paramIndex = getParentPropIndex(localContexts);
                if (paramIndex !== undefined) {
                    const funcTypeParam = functionType.parameters[paramIndex];

                    // TODO: handle function overloads: funcTypeParam must always be defined!
                    if (funcTypeParam && node.type === AST_NODE_TYPES.Identifier) {
                        return singleEntryConceptMap(
                            LCEParameterDeclaration.conceptId,
                            new LCEParameterDeclaration(
                                funcTypeParam.index,
                                funcTypeParam.name,
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
