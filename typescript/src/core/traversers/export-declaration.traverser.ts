import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {ConceptMap, mergeConceptMaps} from "../concept";
import {ProcessingContext} from "../context";
import {ProcessorMap} from "../processor";
import {Traverser} from "../traverser";
import {runTraverserForNode} from "../traverser.utils";

export class ExportNamedDeclarationTraverser extends Traverser {
    public static readonly DECLARATION_PROP = "declaration";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;

        if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
            if (node.declaration)
                return (
                    runTraverserForNode(
                        node.declaration,
                        {
                            parentPropName: ExportNamedDeclarationTraverser.DECLARATION_PROP,
                        },
                        processingContext,
                        processors
                    ) ?? new Map()
                );
        }

        return new Map();
    }
}

export class ExportDefaultDeclarationTraverser extends Traverser {
    public static readonly DECLARATION_PROP = "declaration";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;

        if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            return (
                runTraverserForNode(
                    node.declaration,
                    {
                        parentPropName: ExportDefaultDeclarationTraverser.DECLARATION_PROP,
                    },
                    processingContext,
                    processors
                ) ?? new Map()
            );
        }

        return new Map();
    }
}

export class ExportAssignmentTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const {node} = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSExportAssignment) {
            runTraverserForNode(
                node.expression,
                {parentPropName: ExportAssignmentTraverser.EXPRESSION_PROP},
                processingContext,
                processors,
                conceptMaps
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
