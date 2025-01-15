import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";
import { FunctionTraverser } from "./function.traverser";

/**
 * Traversal of method constructs that may occur within (abstract) classes, interfaces, or types.
 * This includes constructors, getters, and setters.
 *
 * Note: This traverser tries to unify the behavior for the traversal of `MethodDefinition`s and `TSMethodSignature`s by
 *  hoisting the child concepts of the function expression contained within the `MethodDefinition` to the method level to
 *  match the concept location with `TSMethodSignature`
 */
export class MethodTraverser extends Traverser {
    public static readonly KEY_PROP = "key";
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly VALUE_PROP = "value";
    public static readonly RETURN_TYPE_PROP = "return-type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (
            node.type === AST_NODE_TYPES.MethodDefinition ||
            node.type === AST_NODE_TYPES.TSMethodSignature ||
            node.type === AST_NODE_TYPES.TSAbstractMethodDefinition
        ) {
            runTraverserForNode(node.key, { parentPropName: MethodTraverser.KEY_PROP }, processingContext, processors, conceptMaps);

            if (node.type === AST_NODE_TYPES.MethodDefinition || node.type === AST_NODE_TYPES.TSAbstractMethodDefinition) {
                if (node.decorators)
                    runTraverserForNodes(
                        node.decorators,
                        { parentPropName: MethodTraverser.DECORATORS_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
                if (node.value) {
                    // This implementation hoists the function expression type parameters, parameters, and return type concepts to the method level to
                    // preserve the correct node parent assignment while allowing for easier processing of methods
                    // see also FunctionTraverser
                    const childConcepts = runTraverserForNode(node.value, { parentPropName: MethodTraverser.VALUE_PROP }, processingContext, processors);
                    if(childConcepts) {
                        const conceptMap: ConceptMap = new Map()
                        if(childConcepts.has(FunctionTraverser.TYPE_PARAMETERS_PROP))
                            conceptMap.set(MethodTraverser.TYPE_PARAMETERS_PROP, childConcepts.get(FunctionTraverser.TYPE_PARAMETERS_PROP)!);
                        if(childConcepts.has(FunctionTraverser.PARAMETERS_PROP))
                            conceptMap.set(MethodTraverser.PARAMETERS_PROP, childConcepts.get(FunctionTraverser.PARAMETERS_PROP)!);
                        if(childConcepts.has(FunctionTraverser.RETURN_TYPE_PROP))
                            conceptMap.set(MethodTraverser.RETURN_TYPE_PROP, childConcepts.get(FunctionTraverser.RETURN_TYPE_PROP)!);
                        conceptMaps.push(conceptMap);
                    }
                }
            } else {
                if(node.typeParameters)
                    runTraverserForNode(
                        node.typeParameters,
                        { parentPropName: MethodTraverser.TYPE_PARAMETERS_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
                runTraverserForNodes(node.params, { parentPropName: MethodTraverser.PARAMETERS_PROP }, processingContext, processors, conceptMaps);
                if(node.returnType)
                    runTraverserForNode(
                        node.returnType,
                        { parentPropName: MethodTraverser.RETURN_TYPE_PROP },
                        processingContext,
                        processors,
                        conceptMaps,
                    );
            }
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

/**
 * Traversal of parameter properties defined within class constructors
 */
export class ParameterPropertyTraverser extends Traverser {
    public static readonly DECORATORS_PROP = "decorators";
    public static readonly PARAMETER_PROP = "parameter";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSParameterProperty) {
            if(node.decorators)
                runTraverserForNodes(
                    node.decorators,
                    { parentPropName: ParameterPropertyTraverser.DECORATORS_PROP },
                    processingContext,
                    processors,
                    conceptMaps
                );

            runTraverserForNode(
                node.parameter,
                { parentPropName: ParameterPropertyTraverser.PARAMETER_PROP },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
