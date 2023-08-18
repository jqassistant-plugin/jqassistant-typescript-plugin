import { AST_NODE_TYPES } from "@typescript-eslint/types";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { LCEInterfaceDeclaration } from "../concepts/interface-declaration.concept";
import { LCEMethodDeclaration } from "../concepts/method-declaration.concept";
import { LCEPropertyDeclaration } from "../concepts/property-declaration.concept";
import { LCETypeDeclared } from "../concepts/type.concept";
import { ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteChildConcepts, getParentPropName } from "../processor.utils";
import { ClassTraverser } from "../traversers/class.traverser";
import { InterfaceDeclarationTraverser } from "../traversers/interface-declaration.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseClassLikeBaseType, parseClassLikeTypeParameters } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";
import { LCEAccessorProperty } from "../concepts/accessor-declaration.concept";

export class InterfaceDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.TSInterfaceDeclaration], ({ node }) => {
        return (
            !!node.parent &&
            (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                node.parent.type === AST_NODE_TYPES.Program)
        );
    });

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration && node.id) {
            DependencyResolutionProcessor.addScopeContext(localContexts, node.id.name);
            DependencyResolutionProcessor.createDependencyIndex(localContexts);
        }
    }

    public override postChildrenProcessing({ globalContext, localContexts, node }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
            const interfaceName = node.id.name;
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, interfaceName, fqn, true);

            // merge accessor properties
            const childAccProps = getAndDeleteChildConcepts<LCEAccessorProperty>(
                InterfaceDeclarationTraverser.MEMBERS_PROP,
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
                } else {
                    accessorProperties.set(accProp.fqn, accProp);
                }
            }

            const interfaceDecl = new LCEInterfaceDeclaration(
                interfaceName,
                fqn,
                parseClassLikeTypeParameters({ globalContext, localContexts, node }, node),
                getAndDeleteChildConcepts(InterfaceDeclarationTraverser.EXTENDS_PROP, LCETypeDeclared.conceptId, childConcepts),
                getAndDeleteChildConcepts(InterfaceDeclarationTraverser.MEMBERS_PROP, LCEPropertyDeclaration.conceptId, childConcepts),
                getAndDeleteChildConcepts(InterfaceDeclarationTraverser.MEMBERS_PROP, LCEMethodDeclaration.conceptId, childConcepts),
                [...accessorProperties.values()],
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node, true),
            );
            return mergeConceptMaps(
                singleEntryConceptMap(LCEInterfaceDeclaration.conceptId, interfaceDecl),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
            );
        }
        return new Map();
    }
}

export class SuperInterfaceDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Identifier],
        ({node, localContexts}) =>
            !!node.parent &&
            node.parent.type === AST_NODE_TYPES.TSInterfaceHeritage &&
            getParentPropName(localContexts) === ClassTraverser.EXTENDS_PROP
    );

    public override postChildrenProcessing({node, localContexts, globalContext}: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.Identifier && node.parent?.type === AST_NODE_TYPES.TSInterfaceHeritage) {
            const superType = parseClassLikeBaseType({
                node,
                localContexts,
                globalContext
            }, node, node.parent.typeArguments?.params);
            if (superType) {
                const typeConcept = singleEntryConceptMap(LCETypeDeclared.conceptId, superType);
                const dependencyConcept = new LCEDependency(
                    superType.fqn,
                    "declaration",
                    DependencyResolutionProcessor.constructScopeFQN(localContexts),
                    "declaration",
                    1
                );
                return mergeConceptMaps(singleEntryConceptMap(LCEDependency.conceptId, dependencyConcept), typeConcept);
            }
        }
        return new Map();
    }
}
