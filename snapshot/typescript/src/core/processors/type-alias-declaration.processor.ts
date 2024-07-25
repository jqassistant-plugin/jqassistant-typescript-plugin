import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCETypeAliasDeclaration } from "../concepts/type-alias-declaration.concept";
import { FQN, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseESNodeType, parseTypeAliasTypeParameters } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";

export class TypeAliasDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.TSTypeAliasDeclaration], ({ node }) => {
        return (
            !!node.parent &&
            (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                node.parent.type === AST_NODE_TYPES.Program)
        );
    });

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            const fqnIdentifier = DependencyResolutionProcessor.isDefaultDeclaration(localContexts, node, node.id?.name) ? "default" : node.id.name;
            if (fqnIdentifier) {
                DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(node.id.name));
                DependencyResolutionProcessor.createDependencyIndex(localContexts);
            }
        }
    }

    public override postChildrenProcessing({ globalContext, localContexts, node, ...unusedProcessingContext }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
            const typeAliasName = DependencyResolutionProcessor.constructDeclarationIdentifier(localContexts, node, node.id.name);
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, typeAliasName, fqn, true);
            const typeAliasDecl = new LCETypeAliasDeclaration(
                typeAliasName,
                fqn,
                parseTypeAliasTypeParameters({ globalContext, localContexts, node, ...unusedProcessingContext }, node),
                parseESNodeType({ globalContext, localContexts, node, ...unusedProcessingContext }, node.typeAnnotation, typeAliasName),
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node, true),
            );
            return mergeConceptMaps(
                singleEntryConceptMap(LCETypeAliasDeclaration.conceptId, typeAliasDecl),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
            );
        }
        return new Map();
    }
}
