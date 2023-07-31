import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {ConceptMap, mergeConceptMaps, singleEntryConceptMap} from "../concept";
import {LCEDependency} from "../concepts/dependency.concept";
import {LCEInterfaceDeclaration} from "../concepts/interface-declaration.concept";
import {LCEGetterDeclaration, LCEMethodDeclaration, LCESetterDeclaration} from "../concepts/method-declaration.concept";
import {LCEPropertyDeclaration} from "../concepts/property-declaration.concept";
import {LCETypeDeclared} from "../concepts/type.concept";
import {ProcessingContext} from "../context";
import {ExecutionCondition} from "../execution-condition";
import {Processor} from "../processor";
import {getAndDeleteChildConcepts, getParentPropName} from "../processor.utils";
import {ClassTraverser} from "../traversers/class.traverser";
import {InterfaceDeclarationTraverser} from "../traversers/interface-declaration.traverser";
import {DependencyResolutionProcessor} from "./dependency-resolution.processor";
import {parseClassLikeBaseType, parseClassLikeTypeParameters} from "./type.utils";
import {CodeCoordinateUtils} from "./code-coordinate.utils";

export class InterfaceDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.TSInterfaceDeclaration], ({node}) => {
        return (
            !!node.parent &&
            (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                node.parent.type === AST_NODE_TYPES.Program)
        );
    });

    public override preChildrenProcessing({node, localContexts}: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration && node.id) {
            DependencyResolutionProcessor.addScopeContext(localContexts, node.id.name);
            DependencyResolutionProcessor.createDependencyIndex(localContexts);
        }
    }

    public override postChildrenProcessing({
                                               globalContext,
                                               localContexts,
                                               node
                                           }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.TSInterfaceDeclaration) {
            const interfaceName = node.id.name;
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, interfaceName, fqn, true);
            const interfaceDecl = new LCEInterfaceDeclaration(
                interfaceName,
                fqn,
                parseClassLikeTypeParameters({globalContext, localContexts, node}, node),
                getAndDeleteChildConcepts(InterfaceDeclarationTraverser.EXTENDS_PROP, LCETypeDeclared.conceptId, childConcepts),
                getAndDeleteChildConcepts(ClassTraverser.MEMBERS_PROP, LCEPropertyDeclaration.conceptId, childConcepts),
                getAndDeleteChildConcepts(ClassTraverser.MEMBERS_PROP, LCEMethodDeclaration.conceptId, childConcepts),
                getAndDeleteChildConcepts(ClassTraverser.MEMBERS_PROP, LCEGetterDeclaration.conceptId, childConcepts),
                getAndDeleteChildConcepts(ClassTraverser.MEMBERS_PROP, LCESetterDeclaration.conceptId, childConcepts),
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node)
            );
            return mergeConceptMaps(
                singleEntryConceptMap(LCEInterfaceDeclaration.conceptId, interfaceDecl),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts)
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
            }, node, node.parent.typeParameters?.params);
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
