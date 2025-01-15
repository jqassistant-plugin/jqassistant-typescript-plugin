import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode } from "../utils/traverser.utils";

export class ExportNamedDeclarationTraverser extends Traverser {
    public static readonly DECLARATION_PROP = "declaration";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ExportNamedDeclaration) {
            if (node.declaration)
                runTraverserForNode(
                    node.declaration,
                    { parentPropName: ExportNamedDeclarationTraverser.DECLARATION_PROP },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ExportDefaultDeclarationTraverser extends Traverser {
    public static readonly DECLARATION_PROP = "declaration";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
            runTraverserForNode(
                node.declaration,
                { parentPropName: ExportDefaultDeclarationTraverser.DECLARATION_PROP },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ExportAssignmentTraverser extends Traverser {
    public static readonly EXPRESSION_PROP = "expression";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSExportAssignment) {
            runTraverserForNode(
                node.expression,
                { parentPropName: ExportAssignmentTraverser.EXPRESSION_PROP },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
