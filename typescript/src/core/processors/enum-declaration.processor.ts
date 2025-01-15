import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, singleEntryConceptMap } from "../concept";
import { LCEEnumDeclaration, LCEEnumMember } from "../concepts/enum-declaration.concept";
import { FQN, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteAllValueChildConcepts, getAndDeleteChildConcepts } from "../utils/processor.utils";
import { EnumDeclarationTraverser, EnumMemberTraverser } from "../traversers/enum.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { CodeCoordinateUtils } from "./code-coordinate.utils";
import { CoreContextKeys } from "../context.keys";

export class EnumDeclarationProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.TSEnumDeclaration], ({ node }) => {
        return (
            !!node.parent &&
            (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                node.parent.type === AST_NODE_TYPES.Program)
        );
    });

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        localContexts.currentContexts.set(CoreContextKeys.ENUM_MEMBERS_PROCESSING_FLAG, true);
        if (node.type === AST_NODE_TYPES.TSEnumDeclaration) {
            const fqnIdentifier = DependencyResolutionProcessor.isDefaultDeclaration(localContexts, node, node.id.name) ? "default" : node.id.name;
            if (fqnIdentifier) {
                DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(fqnIdentifier));
                DependencyResolutionProcessor.createDependencyIndex(localContexts);
            }
        }
    }

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.TSEnumDeclaration) {
            const enumName = DependencyResolutionProcessor.constructDeclarationIdentifier(localContexts, node, node.id.name);
            const fqn = DependencyResolutionProcessor.constructScopeFQN(localContexts);
            DependencyResolutionProcessor.registerDeclaration(localContexts, enumName, fqn, true);

            const members: LCEEnumMember[] = getAndDeleteChildConcepts(EnumDeclarationTraverser.BODY_PROP, LCEEnumMember.conceptId, childConcepts);

            const enumeration = new LCEEnumDeclaration(
                enumName,
                fqn,
                members,
                node.const ?? false,
                node.declare ?? false,
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node, true),
            );

            return singleEntryConceptMap(LCEEnumDeclaration.conceptId, enumeration);
        }
        return new Map();
    }
}

export class EnumMemberProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.TSEnumMember], ({ localContexts }) => {
        const context = localContexts.getNextContext(CoreContextKeys.ENUM_MEMBERS_PROCESSING_FLAG);
        return !!context && context[1] === 2;
    });

    public override preChildrenProcessing({ node, localContexts }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.TSEnumMember && node.initializer)
            localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
    }

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext, childConcepts: ConceptMap): ConceptMap {
        if (node.type === AST_NODE_TYPES.TSEnumMember && !node.computed) {
            const init = getAndDeleteAllValueChildConcepts(EnumMemberTraverser.INIT_PROP, childConcepts);

            const memberName = node.id.type === AST_NODE_TYPES.Identifier ? node.id.name : node.id.raw;
            const fqnPrefix = DependencyResolutionProcessor.constructFQNPrefix(localContexts);

            const member = new LCEEnumMember(
                memberName,
                new FQN(fqnPrefix.globalFqn + memberName, fqnPrefix.localFqn + memberName),
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node),
                init.length === 1 ? init[0] : undefined,
            );
            return singleEntryConceptMap(LCEEnumMember.conceptId, member);
        }
        // TODO: add enum member with computed names
        return new Map();
    }
}
