import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { Identifier, Literal, Node as ESNode } from "@typescript-eslint/types/dist/generated/ast-spec";

import { ConceptMap } from "../concept";
import { LCETypeDeclared } from "../concepts/type.concept";
import { FQN, LocalContexts, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getParentPropName } from "../utils/processor.utils";
import { ClassTraverser } from "../traversers/class.traverser";
import {
    ArrowFunctionExpressionTraverser,
    MemberExpressionTraverser,
    TaggedTemplateExpressionTraverser
} from "../traversers/expression.traverser";
import { FunctionTraverser } from "../traversers/function.traverser";
import { MethodTraverser } from "../traversers/method.traverser";
import { PropertyTraverser } from "../traversers/property.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseESNodeType } from "./type.utils";
import { TypeAliasDeclarationTraverser } from "../traversers/type-alias-declaration.traverser";
import { CoreContextKeys } from "../context.keys";
import { TraverserContext } from "../traverser";

/**
 * Registers unnamed `FQNScope` local contexts for all nodes that create a new anonymous scope.
 */
export class ScopeProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.BlockStatement, AST_NODE_TYPES.ForStatement, AST_NODE_TYPES.ForInStatement, AST_NODE_TYPES.ForOfStatement],
        () => true,
    );

    public override preChildrenProcessing({ localContexts }: ProcessingContext): void {
        DependencyResolutionProcessor.addScopeContext(localContexts);
    }
}

/**
 * Registers named `FQNScope` local contexts for all declaration nodes.
 */
export class DeclarationScopeProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [
            AST_NODE_TYPES.ClassDeclaration,
            AST_NODE_TYPES.FunctionDeclaration,
            AST_NODE_TYPES.TSDeclareFunction,
            AST_NODE_TYPES.TSInterfaceDeclaration,
            AST_NODE_TYPES.TSTypeAliasDeclaration,
            AST_NODE_TYPES.TSEnumDeclaration,
        ],
        () => true,
    );

    public override preChildrenProcessing({ localContexts, node }: ProcessingContext): void {
        if (
            (node.type === AST_NODE_TYPES.ClassDeclaration ||
                node.type === AST_NODE_TYPES.FunctionDeclaration ||
                node.type === AST_NODE_TYPES.TSDeclareFunction ||
                node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
                node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
                node.type === AST_NODE_TYPES.TSEnumDeclaration) &&
            node.id
        ) {
            DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(node.id.name));
        } else {
            DependencyResolutionProcessor.addScopeContext(localContexts);
        }
    }
}

export class IdentifierDependencyProcessor extends Processor {
    /**
     * This execution conditions filters out all identifier nodes that are already registered by other processors.
     */
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Identifier],
        ({ node, localContexts }) =>
            !(node.parent?.type === AST_NODE_TYPES.ClassDeclaration && getParentPropName(localContexts) === ClassTraverser.EXTENDS_PROP) &&
            !(
                (node.parent?.type === AST_NODE_TYPES.MethodDefinition || node.parent?.type === AST_NODE_TYPES.TSMethodSignature) &&
                (getParentPropName(localContexts) === MethodTraverser.KEY_PROP ||
                    getParentPropName(localContexts) === MethodTraverser.PARAMETERS_PROP)
            ) &&
            !(
                (node.parent?.type === AST_NODE_TYPES.PropertyDefinition || node.parent?.type === AST_NODE_TYPES.TSPropertySignature) &&
                getParentPropName(localContexts) === PropertyTraverser.KEY_PROP
            ) &&
            !(
                (node.parent?.type === AST_NODE_TYPES.FunctionDeclaration ||
                    node.parent?.type === AST_NODE_TYPES.TSDeclareFunction ||
                    node.parent?.type === AST_NODE_TYPES.FunctionExpression) &&
                getParentPropName(localContexts) === FunctionTraverser.PARAMETERS_PROP
            ) &&
            !(
                node.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression &&
                getParentPropName(localContexts) === ArrowFunctionExpressionTraverser.PARAMETERS_PROP
            ) &&
            !(
                node.parent?.type === AST_NODE_TYPES.TaggedTemplateExpression &&
                getParentPropName(localContexts) === TaggedTemplateExpressionTraverser.TAG_PROP
            ) &&
            !(
                node.parent?.type === AST_NODE_TYPES.MemberExpression && getParentPropName(localContexts) === MemberExpressionTraverser.PROPERTY_PROP
            ) &&
            node.parent?.type !== AST_NODE_TYPES.ArrayPattern &&
            node.parent?.type !== AST_NODE_TYPES.ObjectPattern &&
            node.parent?.type !== AST_NODE_TYPES.ImportExpression &&
            node.parent?.type !== AST_NODE_TYPES.TSInterfaceHeritage &&
            !(node.parent?.type === AST_NODE_TYPES.TSTypeReference && this.isDirectAncestorTypeAnnotation(node, localContexts)),
    );

    /**
     * This method is used to filter out all type identifiers that are part of type annotations or type parameters, as they are already registered via the native type resolution
     */
    private isDirectAncestorTypeAnnotation(node: ESNode, localContexts: LocalContexts): boolean {
        let ancestor = node.parent;
        let localContextIndex = localContexts.contexts.length - 2;
        while (ancestor?.parent) {
            const parentPropName = (localContexts.contexts[localContextIndex].get(CoreContextKeys.TRAVERSER_CONTEXT)! as TraverserContext)
                .parentPropName;
            if (
                ancestor.parent.type === AST_NODE_TYPES.TSTypeAnnotation ||
                (ancestor.parent.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
                    parentPropName === TypeAliasDeclarationTraverser.TYPE_ANNOTATION_PROP) ||
                (ancestor.parent.type === AST_NODE_TYPES.TSTypeAliasDeclaration &&
                    parentPropName === TypeAliasDeclarationTraverser.TYPE_PARAMETERS_PROP) ||
                ((ancestor.parent.type === AST_NODE_TYPES.FunctionExpression ||
                    ancestor.parent.type === AST_NODE_TYPES.FunctionDeclaration ||
                    ancestor.parent.type === AST_NODE_TYPES.TSDeclareFunction ||
                    ancestor.parent.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression) &&
                    parentPropName === FunctionTraverser.TYPE_PARAMETERS_PROP)
            ) {
                return true;
            }
            ancestor = ancestor.parent;
            localContextIndex--;
            if (localContextIndex < 0) {
                break;
            }
        }
        return false;
    }

    override postChildrenProcessing({ node, localContexts }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.Identifier) {
            DependencyResolutionProcessor.registerDependency(localContexts, node.name);
        }

        return new Map();
    }
}

/**
 * Processes member expressions and adds appropriate dependencies.
 * Only processes identifier and direct literal property accesses.
 * Adds dependencies for all type member accesses.
 */
export class MemberExpressionDependencyProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.MemberExpression], () => true);

    override postChildrenProcessing({ node, localContexts, ...unusedProcessingContext }: ProcessingContext): ConceptMap {
        if (
            node.type === AST_NODE_TYPES.MemberExpression &&
            (node.property.type === AST_NODE_TYPES.Identifier || node.property.type === AST_NODE_TYPES.Literal)
        ) {
            const objectType = parseESNodeType({ node, localContexts, ...unusedProcessingContext }, node.object, undefined, true);
            if (objectType instanceof LCETypeDeclared) {
                const globalFqn = objectType.fqn.globalFqn + "." + this.getNamespace(node.property);
                DependencyResolutionProcessor.registerDependency(localContexts, globalFqn, false);
            }
        }
        return new Map();
    }

    private getNamespace(node: Identifier | Literal): string {
        if (node.type === AST_NODE_TYPES.Identifier) {
            return node.name;
        } else {
            return node.raw;
        }
    }
}
