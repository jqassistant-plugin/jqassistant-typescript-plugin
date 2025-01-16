import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import {
    ClassPropertyNameNonComputed,
    Node as ESNode,
    PropertyNameNonComputed
} from "@typescript-eslint/types/dist/generated/ast-spec";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEDecorator } from "../concepts/decorator.concept";
import {
    LCEConstructorDeclaration,
    LCEMethodDeclaration,
    LCEParameterDeclaration,
    LCEParameterPropertyDeclaration
} from "../concepts/method-declaration.concept";
import { LCEPropertyDeclaration } from "../concepts/property-declaration.concept";
import { LCETypeFunction, LCETypeNotIdentified } from "../concepts/type.concept";
import { FQN, LocalContexts, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import {
    getAndDeleteChildConcepts,
    getChildConcepts,
    getParentPropIndex,
    getParentPropName
} from "../utils/processor.utils";
import { IdentifierTraverser } from "../traversers/expression.traverser";
import { MethodTraverser, ParameterPropertyTraverser } from "../traversers/method.traverser";
import { PropertyTraverser } from "../traversers/property.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseClassPropertyType, parseMethodType } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";
import {
    LCEAccessorProperty,
    LCEAutoAccessorDeclaration,
    LCEGetterDeclaration,
    LCESetterDeclaration
} from "../concepts/accessor-declaration.concept";
import { CoreContextKeys } from "../context.keys";
import { FunctionTraverser } from "../traversers/function.traverser";
import { LCEIndexAccessTypeAnnotation } from "../concepts/type-annotation.concept";

/**
 * Extracts concepts for methods of globally declared (abstract) classes and interfaces
 */
export class MethodProcessor extends Processor {

    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.MethodDefinition, AST_NODE_TYPES.TSAbstractMethodDefinition, AST_NODE_TYPES.TSMethodSignature],
        ({localContexts}) => {
            const flagContext = localContexts.getNextContext(CoreContextKeys.PROCESS_CLASS_LIKE_MEMBERS) as [number, number] | undefined;
            return !!flagContext && flagContext[1] == flagContext[0]; // e.g. Method(0) <- ClassBody(1) <- ClassDeclaration(2) (same for interface)
        }
    );

    public override preChildrenProcessing({ node, localContexts, globalContext, ...unusedProcessingContext }: ProcessingContext): void {
        if (
            (node.type === AST_NODE_TYPES.MethodDefinition ||
                node.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
                node.type === AST_NODE_TYPES.TSMethodSignature) &&
            !node.computed
        ) {
            const [methodName, jsPrivate] = processMemberName(node.key);

            DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(methodName));
            DependencyResolutionProcessor.createDependencyIndex(localContexts);

            // TODO: secure against Indexed Access Types
            const functionType = parseMethodType(
                {
                    globalContext,
                    localContexts,
                    node,
                    ...unusedProcessingContext,
                },
                determineParentDeclarationNode(node, localContexts),
                node,
                methodName,
                jsPrivate,
            );
            if (functionType) {
                localContexts.currentContexts.set(CoreContextKeys.METHOD_TYPE, functionType);
            }

            if(node.type === AST_NODE_TYPES.TSMethodSignature) {
                localContexts.currentContexts.set(CoreContextKeys.PROCESS_PARAMETERS, 1);
            } else {
                // in the case of method definitions, the additional nested function expression node must be accounted for
                localContexts.currentContexts.set(CoreContextKeys.PROCESS_PARAMETERS, 2);
            }
        }
    }

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (
            (node.type === AST_NODE_TYPES.MethodDefinition ||
                node.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
                node.type === AST_NODE_TYPES.TSMethodSignature) &&
            !node.computed
        ) {
            // TODO: handle overloads
            const methodType = localContexts.currentContexts.get(CoreContextKeys.METHOD_TYPE) as LCETypeFunction | undefined;
            const parentDeclNode = determineParentDeclarationNode(node, localContexts);
            if (methodType) {
                const [methodName, jsPrivate] = processMemberName(node.key);
                const visibility = jsPrivate ? "js_private" : (node.accessibility ?? "public");
                const inClass =
                    parentDeclNode.type === AST_NODE_TYPES.ClassDeclaration || parentDeclNode.type === AST_NODE_TYPES.ClassExpression;
                const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
                DependencyResolutionProcessor.registerDeclaration(localContexts, methodName, fqn, true);
                let methodConcept: ConceptMap = new Map();
                if (node.kind === "method") {
                    // method
                    if (methodType) {
                        methodConcept = singleEntryConceptMap(
                            LCEMethodDeclaration.conceptId,
                            new LCEMethodDeclaration(
                                methodName,
                                fqn,
                                getAndDeleteChildConcepts(MethodTraverser.PARAMETERS_PROP, LCEParameterDeclaration.conceptId, childConcepts),
                                methodType.returnType,
                                methodType.typeParameters,
                                "decorators" in node
                                    ? getAndDeleteChildConcepts(MethodTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts)
                                    : [],
                                visibility,
                                methodType.async,
                                CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                                "override" in node ? node.override : undefined,
                                inClass ? node.type === AST_NODE_TYPES.TSAbstractMethodDefinition : undefined,
                                inClass ? (node.static ? node.static : false) : undefined,
                            ),
                        );
                    }
                } else if (node.kind === "constructor") {
                    // constructor
                    methodConcept = singleEntryConceptMap(
                        LCEConstructorDeclaration.conceptId,
                        new LCEConstructorDeclaration(
                            fqn,
                            getAndDeleteChildConcepts(MethodTraverser.PARAMETERS_PROP, LCEParameterDeclaration.conceptId, childConcepts),
                            getAndDeleteChildConcepts(MethodTraverser.PARAMETERS_PROP, LCEParameterPropertyDeclaration.conceptId, childConcepts),
                            CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                        ),
                    );
                } else if (node.kind === "get") {
                    // getter
                    methodConcept = singleEntryConceptMap(
                        LCEAccessorProperty.conceptId,
                        new LCEAccessorProperty(
                            fqn,
                            methodName,
                            new LCEGetterDeclaration(
                                methodType.returnType,
                                "decorators" in node
                                    ? getAndDeleteChildConcepts(MethodTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts)
                                    : [],
                                visibility,
                                CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                                "override" in node ? node.override : undefined,
                                inClass ? node.type === AST_NODE_TYPES.TSAbstractMethodDefinition : undefined,
                                inClass ? (node.static ? node.static : false) : undefined,
                            ),
                        ),
                    );
                } else {
                    // setter
                    methodConcept = singleEntryConceptMap(
                        LCEAccessorProperty.conceptId,
                        new LCEAccessorProperty(
                            fqn,
                            methodName,
                            undefined,
                            new LCESetterDeclaration(
                                getAndDeleteChildConcepts(MethodTraverser.PARAMETERS_PROP, LCEParameterDeclaration.conceptId, childConcepts),
                                "decorators" in node
                                    ? getAndDeleteChildConcepts(MethodTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts)
                                    : [],
                                visibility,
                                CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                                "override" in node ? node.override : undefined,
                                inClass ? node.type === AST_NODE_TYPES.TSAbstractMethodDefinition : undefined,
                                inClass ? (node.static ? node.static : false) : undefined,
                            ),
                        ),
                    );
                }
                return mergeConceptMaps(methodConcept, DependencyResolutionProcessor.getRegisteredDependencies(localContexts));
            }
        }
        return new Map();
    }
}

/**
 * Extracts concepts for method parameters of globally declared (abstract) classes and interfaces
 */
export class MethodParameterProcessor extends Processor {

    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Identifier, AST_NODE_TYPES.TSParameterProperty], // TODO: add other parameter patterns
        ({ localContexts }) => {
            const flagContext = localContexts.getNextContext(CoreContextKeys.PROCESS_PARAMETERS) as [number, number] | undefined;
            const parentPropName = getParentPropName(localContexts);
            return !!flagContext && flagContext[1] == flagContext[0] &&
                (parentPropName === MethodTraverser.PARAMETERS_PROP || parentPropName === FunctionTraverser.PARAMETERS_PROP);
        }
    );

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        const flagContext = localContexts.getNextContext(CoreContextKeys.PROCESS_PARAMETERS) as [number, number];
        const methodTypeContext = localContexts.getNextContext(CoreContextKeys.METHOD_TYPE) as [LCETypeFunction, number] | undefined;

        // only process parameters, if the required function type could be determined for the method that set the processing flag
        if (methodTypeContext && methodTypeContext[1] === flagContext[1]) {
            const methodType = methodTypeContext[0];
            const paramIndex = getParentPropIndex(localContexts);
            if (paramIndex !== undefined && methodType.parameters[paramIndex]) {
                const methodTypeParam = methodType.parameters[paramIndex];

                if (node.type === AST_NODE_TYPES.Identifier) {
                    const scopeFqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
                    DependencyResolutionProcessor.registerDeclaration(
                        localContexts,
                        methodTypeParam.name,
                        new FQN(scopeFqn.globalFqn + "." + methodTypeParam.name, scopeFqn.localFqn + "." + methodTypeParam.name),
                    );
                    return singleEntryConceptMap(
                        LCEParameterDeclaration.conceptId,
                        new LCEParameterDeclaration(
                            methodTypeParam.index,
                            methodTypeParam.name,
                            methodTypeParam.type,
                            "optional" in node && !!node.optional,
                            getAndDeleteChildConcepts(IdentifierTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts),
                            CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                        ),
                    );
                } else if (node.type === AST_NODE_TYPES.TSParameterProperty) {
                    const scopeFqn = DependencyResolutionProcessor.constructScopeFQN(localContexts, true);
                    const paramPropFQN = new FQN(
                        scopeFqn.globalFqn.replace(".constructor", "") + "." + methodTypeParam.name,
                        scopeFqn.localFqn.replace(".constructor", "") + "." + methodTypeParam.name,
                    );
                    const paramPropConcept = singleEntryConceptMap(
                        LCEParameterPropertyDeclaration.conceptId,
                        new LCEParameterPropertyDeclaration(
                            methodTypeParam.index,
                            methodTypeParam.name,
                            paramPropFQN,
                            "optional" in node.parameter && node.parameter.optional,
                            methodTypeParam.type,
                            getChildConcepts(ParameterPropertyTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts),
                            node.accessibility ?? "public",
                            node.readonly,
                            CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                            node.override ?? false,
                        ),
                    );
                    const paramConcept = singleEntryConceptMap(
                        LCEParameterDeclaration.conceptId,
                        new LCEParameterDeclaration(
                            methodTypeParam.index,
                            methodTypeParam.name,
                            methodTypeParam.type,
                            "optional" in node.parameter && node.parameter.optional,
                            getAndDeleteChildConcepts(ParameterPropertyTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts),
                            CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                        ),
                    );
                    DependencyResolutionProcessor.registerDeclaration(localContexts, methodTypeParam.name, paramPropFQN, true);
                    return mergeConceptMaps(paramConcept, paramPropConcept);
                }
            }
        }

        return new Map();
    }
}

export class PropertyProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.PropertyDefinition, AST_NODE_TYPES.TSAbstractPropertyDefinition, AST_NODE_TYPES.TSPropertySignature],
        ({localContexts}) => {
            const flagContext = localContexts.getNextContext(CoreContextKeys.PROCESS_CLASS_LIKE_MEMBERS) as [number, number] | undefined;
            return !!flagContext && flagContext[1] == flagContext[0]; // e.g. Property(0) <- ClassBody(1) <- ClassDeclaration(2) (same for interface)
        }
    );

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        if (
            (node.type === AST_NODE_TYPES.PropertyDefinition ||
                node.type === AST_NODE_TYPES.TSAbstractPropertyDefinition ||
                node.type === AST_NODE_TYPES.TSPropertySignature) &&
            !node.computed
        ) {
            const [propertyName] = processMemberName(node.key);
            DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(propertyName));
            DependencyResolutionProcessor.createDependencyIndex(localContexts);
        }
    }

    public override postChildrenProcessing(
        { node, localContexts, globalContext, ...unusedProcessingContext }: ProcessingContext,
        childConcepts: ConceptMap,
    ): ConceptMap {
        if (
            (node.type === AST_NODE_TYPES.PropertyDefinition ||
                node.type === AST_NODE_TYPES.TSPropertySignature ||
                node.type === AST_NODE_TYPES.TSAbstractPropertyDefinition) &&
            !node.computed
        ) {
            const [propertyName, jsPrivate] = processMemberName(node.key);
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, propertyName, fqn, true);
            const parentDeclNode = determineParentDeclarationNode(node, localContexts);
            const inClass = parentDeclNode.type === AST_NODE_TYPES.ClassDeclaration || parentDeclNode.type === AST_NODE_TYPES.ClassExpression;

            // indexed access type check to prevent infinite recursion on native type parsing
            const isIndexedAccessType = getAndDeleteChildConcepts<LCEIndexAccessTypeAnnotation>(PropertyTraverser.TYPE_ANNOTATION_PROP, LCEIndexAccessTypeAnnotation.conceptId, childConcepts).length > 0;
            const type = isIndexedAccessType ?
                new LCETypeNotIdentified("Type contains indexed access type (potentially recursive)") :
                parseClassPropertyType({ globalContext, localContexts, node, ...unusedProcessingContext }, node.key);

            return mergeConceptMaps(
                singleEntryConceptMap(
                    LCEPropertyDeclaration.conceptId,
                    new LCEPropertyDeclaration(
                        propertyName,
                        fqn,
                        node.optional,
                        type,
                        "decorators" in node
                            ? getAndDeleteChildConcepts(PropertyTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts)
                            : [],
                        jsPrivate ? "js_private" : (node.accessibility ?? "public"),
                        node.readonly,
                        CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                        "override" in node ? node.override : undefined,
                        inClass ? node.type === AST_NODE_TYPES.TSAbstractPropertyDefinition : undefined,
                        inClass ? (node.static ? node.static : false) : undefined,
                    ),
                ),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
            );
        }

        return new Map();
    }
}

export class AutoAccessorDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.AccessorProperty, AST_NODE_TYPES.TSAbstractAccessorProperty],
        ({localContexts}) => {
            const flagContext = localContexts.getNextContext(CoreContextKeys.PROCESS_CLASS_LIKE_MEMBERS) as [number, number] | undefined;
            return !!flagContext && flagContext[1] == flagContext[0]; // e.g. AccessorProperty(0) <- ClassBody(1) <- ClassDeclaration(2) (same for interface)
        }
    );

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        if ((node.type === AST_NODE_TYPES.AccessorProperty || node.type === AST_NODE_TYPES.TSAbstractAccessorProperty) && !node.computed) {
            const [accessorPropertyName] = processMemberName(node.key);
            DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(accessorPropertyName));
            DependencyResolutionProcessor.createDependencyIndex(localContexts);
        }
    }

    public override postChildrenProcessing(
        { node, localContexts, globalContext, ...unusedProcessingContext }: ProcessingContext,
        childConcepts: ConceptMap,
    ): ConceptMap {
        if ((node.type === AST_NODE_TYPES.AccessorProperty || node.type === AST_NODE_TYPES.TSAbstractAccessorProperty) && !node.computed) {
            const [accessorPropertyName, jsPrivate] = processMemberName(node.key);
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, accessorPropertyName, fqn, true);
            return mergeConceptMaps(
                singleEntryConceptMap(
                    LCEAccessorProperty.conceptId,
                    new LCEAccessorProperty(
                        fqn,
                        accessorPropertyName,
                        undefined,
                        undefined,
                        new LCEAutoAccessorDeclaration(
                            parseClassPropertyType({ globalContext, localContexts, node, ...unusedProcessingContext }, node.key),
                            "decorators" in node
                                ? getAndDeleteChildConcepts(PropertyTraverser.DECORATORS_PROP, LCEDecorator.conceptId, childConcepts)
                                : [],
                            jsPrivate ? "js_private" : (node.accessibility ?? "public"),
                            CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                            node.override,
                            node.type === AST_NODE_TYPES.TSAbstractAccessorProperty,
                            node.static ? node.static : false,
                        ),
                    ),
                ),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
            );
        }

        return new Map();
    }
}

/**
 * Returns the field or method name for a given non-computed class element.
 * Also returns if the element was declared private by using the # prefix
 */
function processMemberName(name: ClassPropertyNameNonComputed | PropertyNameNonComputed): [string, boolean] {
    let result: string;
    let jsPrivate = false;

    if (name.type === AST_NODE_TYPES.Identifier) {
        result = name.name;
    } else if (name.type === AST_NODE_TYPES.Literal) {
        result = name.value + "";
    } else {
        result = name.name;
        jsPrivate = true;
    }

    return [result, jsPrivate];
}

/**
 * Determine node of ancestor that triggered the processing of members
 */
function determineParentDeclarationNode(currentNode: ESNode, localContexts: LocalContexts): ESNode {
    const flagContext = localContexts.getNextContext(CoreContextKeys.PROCESS_CLASS_LIKE_MEMBERS) as [number, number] | undefined;
    let parentDeclNode: ESNode = currentNode;
    for(let i = flagContext![1]; i > 0; --i) {
        if(parentDeclNode.parent) {
            parentDeclNode = parentDeclNode.parent;
        }
    }
    return parentDeclNode;
}
