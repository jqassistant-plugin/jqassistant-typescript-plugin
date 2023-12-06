import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEClassDeclaration } from "../concepts/class-declaration.concept";
import { LCEDecorator } from "../concepts/decorator.concept";
import { LCEConstructorDeclaration, LCEMethodDeclaration } from "../concepts/method-declaration.concept";
import { LCEPropertyDeclaration } from "../concepts/property-declaration.concept";
import { LCETypeDeclared } from "../concepts/type.concept";
import { ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteChildConcepts, getParentPropName } from "../utils/processor.utils";
import { ClassTraverser } from "../traversers/class.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseClassLikeBaseType, parseClassLikeTypeParameters } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";
import { LCEAccessorProperty } from "../concepts/accessor-declaration.concept";

export class ClassDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.ClassDeclaration], ({ node }) => {
        return (
            !!node.parent &&
            (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                node.parent.type === AST_NODE_TYPES.Program)
        );
    });

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.ClassDeclaration && node.id) {
            DependencyResolutionProcessor.addScopeContext(localContexts, node.id.name);
            DependencyResolutionProcessor.createDependencyIndex(localContexts);
        }
    }

    public override postChildrenProcessing(
        { globalContext, localContexts, node, ...unusedProcessingContext }: ProcessingContext,
        childConcepts: ConceptMap,
    ): ConceptMap {
        if (node.type === AST_NODE_TYPES.ClassDeclaration) {
            const className = node.id?.name ?? "";
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, className, fqn, true);

            // merge accessor properties
            const childAccProps = getAndDeleteChildConcepts<LCEAccessorProperty>(
                ClassTraverser.MEMBERS_PROP,
                LCEAccessorProperty.conceptId,
                childConcepts,
            );
            const accessorProperties: Map<string, LCEAccessorProperty> = new Map();
            for (const accProp of childAccProps) {
                if (accessorProperties.has(accProp.fqn)) {
                    const existingAccProp = accessorProperties.get(accProp.fqn)!;
                    if (!existingAccProp.getter) {
                        existingAccProp.getter = accProp.getter;
                    }
                    if (!existingAccProp.setter) {
                        existingAccProp.setter = accProp.setter;
                    }
                    if (!existingAccProp.autoAccessor) {
                        existingAccProp.autoAccessor = accProp.autoAccessor;
                    }
                } else {
                    accessorProperties.set(accProp.fqn, accProp);
                }
            }

            const classDecl = new LCEClassDeclaration(
                className,
                fqn,
                node.abstract ?? false,
                parseClassLikeTypeParameters({ globalContext, localContexts, node, ...unusedProcessingContext }, node),
                getAndDeleteChildConcepts<LCETypeDeclared>(ClassTraverser.EXTENDS_PROP, LCETypeDeclared.conceptId, childConcepts)[0],
                getAndDeleteChildConcepts(ClassTraverser.IMPLEMENTS_PROP, LCETypeDeclared.conceptId, childConcepts),
                getAndDeleteChildConcepts<LCEConstructorDeclaration>(
                    ClassTraverser.MEMBERS_PROP,
                    LCEConstructorDeclaration.conceptId,
                    childConcepts,
                )[0],
                getAndDeleteChildConcepts(ClassTraverser.MEMBERS_PROP, LCEPropertyDeclaration.conceptId, childConcepts),
                getAndDeleteChildConcepts(ClassTraverser.MEMBERS_PROP, LCEMethodDeclaration.conceptId, childConcepts),
                [...accessorProperties.values()],
                getAndDeleteChildConcepts(ClassTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts),
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node, true),
            );
            DependencyResolutionProcessor.scheduleFqnResolution(localContexts, className, classDecl);

            return mergeConceptMaps(
                singleEntryConceptMap(LCEClassDeclaration.conceptId, classDecl),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
            );
        }
        return new Map();
    }
}

export class SuperClassDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Identifier, AST_NODE_TYPES.MemberExpression],
        ({node, localContexts}) =>
            !!node.parent && node.parent.type === AST_NODE_TYPES.ClassDeclaration && getParentPropName(localContexts) === ClassTraverser.EXTENDS_PROP
    );

    public override postChildrenProcessing({node, ...unusedProcessingContext}: ProcessingContext): ConceptMap {
        if(node.parent?.type === AST_NODE_TYPES.ClassDeclaration) {
            if (node.type === AST_NODE_TYPES.Identifier || node.type === AST_NODE_TYPES.MemberExpression) {
                const superType = parseClassLikeBaseType({
                    node,
                    ...unusedProcessingContext
                }, node, node.parent.superTypeArguments?.params);
                if (superType) {
                    return singleEntryConceptMap(LCETypeDeclared.conceptId, superType);
                }
            }
        }
        return new Map();
    }
}

export class ImplementsDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.TSClassImplements],
        ({node, localContexts}) =>
            !!node.parent &&
            node.parent.type === AST_NODE_TYPES.ClassDeclaration &&
            getParentPropName(localContexts) === ClassTraverser.IMPLEMENTS_PROP
    );

    public override postChildrenProcessing({node, ...unusedProcessingContext}: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.TSClassImplements) {
            const implementsType = parseClassLikeBaseType({
                node,
                ...unusedProcessingContext
            }, node, node.typeArguments?.params);
            if (implementsType) {
                return singleEntryConceptMap(LCETypeDeclared.conceptId, implementsType);
            }
        }
        return new Map();
    }
}
