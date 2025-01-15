import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class EnumDeclarationTraverser extends Traverser {
    public static readonly BODY_PROP = "body";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSEnumDeclaration) {
            runTraverserForNode(node.body, { parentPropName: EnumDeclarationTraverser.BODY_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class EnumBodyTraverser extends Traverser {
    public static readonly MEMBERS_PROP = "members";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSEnumBody) {
            runTraverserForNodes(node.members, { parentPropName: EnumBodyTraverser.MEMBERS_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class EnumMemberTraverser extends Traverser {
    public static readonly INIT_PROP = "initializer";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSEnumMember) {
            if (node.initializer)
                runTraverserForNode(node.initializer, { parentPropName: EnumMemberTraverser.INIT_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
