import {AST_NODE_TYPES} from "@typescript-eslint/types";
import {ConceptMap, mergeConceptMaps} from "../../core/concept";
import {ProcessingContext} from "../../core/context";
import {ProcessorMap} from "../../core/processor";
import {Traverser} from "../../core/traverser";
import {runTraverserForNode, runTraverserForNodes} from "../../core/traverser.utils";

export class JSXElementTraverser extends Traverser {
    public static readonly CHILDREN_PROP = "children";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.JSXElement) {
            runTraverserForNodes(node.children, { parentPropName: JSXElementTraverser.CHILDREN_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class JSXOpeningElementTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly ATTRIBUTES_PROP = "attributes";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.JSXOpeningElement) {
            if (node.typeParameters) {
                runTraverserForNodes(
                    node.typeParameters?.params,
                    { parentPropName: JSXOpeningElementTraverser.TYPE_PARAMETERS_PROP },
                    processingContext,
                    processors,
                    conceptMaps
                );
            }

            runTraverserForNodes(
                node.attributes,
                { parentPropName: JSXOpeningElementTraverser.ATTRIBUTES_PROP },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class JSXAttributeTraverser extends Traverser {
    public static readonly VALUE_PROP = "value";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.JSXAttribute) {
            if (node.value) {
                runTraverserForNode(node.value, { parentPropName: JSXAttributeTraverser.VALUE_PROP }, processingContext, processors, conceptMaps);
            }
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class JSXSpreadAttributeTraverser extends Traverser {
    public static readonly ARGUMENT_PROP = "argument";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.JSXSpreadAttribute) {
            runTraverserForNode(
                node.argument,
                { parentPropName: JSXSpreadAttributeTraverser.ARGUMENT_PROP },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class JSXSpreadChildTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.JSXSpreadChild) {
            runTraverserForNode(
                node.expression,
                { parentPropName: JSXSpreadChildTraverser.EXPRESSION_PROP },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class JSXExpressionContainerTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.JSXExpressionContainer) {
            runTraverserForNode(
                node.expression,
                { parentPropName: JSXExpressionContainerTraverser.EXPRESSION_PROP },
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
