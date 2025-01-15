import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";

import { ConceptMap, mergeConceptMaps, unifyConceptMap } from "../concept";
import { ProcessingContext } from "../context";
import { TRAVERSERS } from "../features";
import { ProcessorMap } from "../processor";
import { TraverserContext } from "../traverser";

/**
 * Tries to find an appropriate `Traverser` for the given node and calls its `traverse` method on the node.
 *
 * @param node child node of the node of the current processing context
 * @param traverserContext `TraverserContext` containing the property name of provided child node
 * @param parentNode/unusedProcessingContext current processing context
 * @param processors processors provided to a traverser
 * @param conceptMaps array of `ConceptMap`s to which extracted child concepts will be added under the property name of the parent node
 * @returns the concepts generated for the node and/or its children or `undefined` if no `Traverser` could be found
 */
export function runTraverserForNode(
    node: Node,
    traverserContext: TraverserContext,
    {node: parentNode, ...unusedProcessingContext}: ProcessingContext,
    processors: ProcessorMap,
    conceptMaps?: ConceptMap[]
): ConceptMap | undefined {
    const traverser = TRAVERSERS.get(node.type);
    if (traverser) {
        node.parent = parentNode;
        const result = traverser.traverse(
            traverserContext,
            {
                node,
                ...unusedProcessingContext
            },
            processors
        );
        if (conceptMaps) conceptMaps.push(unifyConceptMap(result, traverserContext.parentPropName));
        return result;
    } else {
        return undefined;
    }
}

/**
 * Runs`runTraverserForNode` for the given nodes.
 * Also provides index information of the parent node property to the traversers.
 *
 * @param nodes child nodes of the node of the current processing context
 * @param traverserContext `TraverserContext` containing the property name of provided child nodes
 * @param processingContext current processing context
 * @param processors processors provided to a traverser
 * @param conceptMaps array of `ConceptMap`s to which extracted child concepts will be added
 */
export function runTraverserForNodes(
    nodes: (Node | null)[],
    {parentPropName}: TraverserContext,
    processingContext: ProcessingContext,
    processors: ProcessorMap,
    conceptMaps?: ConceptMap[]
): ConceptMap | undefined {
    const unifiedConcepts: ConceptMap[] = [];
    let rawResults: ConceptMap = new Map();
    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n) {
            const result = runTraverserForNode(n, {parentPropName, parentPropIndex: i}, processingContext, processors, unifiedConcepts);
            if(result) {
                rawResults = mergeConceptMaps(result, rawResults);
            }
        }
    }
    if (unifiedConcepts.length > 0) {
        const mergedUnifiedConcepts = mergeConceptMaps(...unifiedConcepts);
        if (conceptMaps) conceptMaps.push(mergedUnifiedConcepts);
        return rawResults;
    } else {
        return undefined;
    }
}
