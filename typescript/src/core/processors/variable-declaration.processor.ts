import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, mergeConceptMaps, singleEntryConceptMap } from "../concept";
import { LCEValue, LCEValueComplex } from "../concepts/value.concept";
import { LCEVariableDeclaration } from "../concepts/variable-declaration.concept";
import { FQN, ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { getAndDeleteAllValueChildConcepts } from "../utils/processor.utils";
import { VariableDeclaratorTraverser } from "../traversers/variable-declaration.traverser";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { parseESNodeType } from "./type.utils";
import { CodeCoordinateUtils } from "./code-coordinate.utils";
import { CoreContextKeys } from "../context.keys";

export class VariableDeclarationProcessor extends Processor {
    public static readonly VARIABLE_DECLARATION_KIND_CONTEXT = "variable-declaration-type";

    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.VariableDeclaration], ({ node }) => {
        return (
            !!node.parent &&
            (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                node.parent.type === AST_NODE_TYPES.Program)
        );
    });

    public override preChildrenProcessing({ localContexts, node }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.VariableDeclaration) {
            localContexts.currentContexts.set(VariableDeclarationProcessor.VARIABLE_DECLARATION_KIND_CONTEXT, node.kind);
        }
    }
}

export class VariableDeclaratorProcessor extends Processor {
    public static readonly VARIABLE_DECLARATOR_FQN_CONTEXT = "variable-declarator-fqn";

    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.VariableDeclarator], ({ localContexts }) => {
        return !!localContexts.parentContexts?.get(VariableDeclarationProcessor.VARIABLE_DECLARATION_KIND_CONTEXT);
    });

    public override preChildrenProcessing({ localContexts, node }: ProcessingContext): void {
        if (node.type === AST_NODE_TYPES.VariableDeclarator && node.id.type === AST_NODE_TYPES.Identifier) {
            if (node.init) localContexts.currentContexts.set(CoreContextKeys.VALUE_PROCESSING_FLAG, true);
            localContexts.currentContexts.set(
                VariableDeclaratorProcessor.VARIABLE_DECLARATOR_FQN_CONTEXT,
                DependencyResolutionProcessor.constructDeclarationFQN(localContexts, node.parent, node.id.name),
            );
            if (DependencyResolutionProcessor.isDefaultDeclaration(localContexts, node.parent, node.id.name)) {
                DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id("default"));
            } else {
                DependencyResolutionProcessor.addScopeContext(localContexts, FQN.id(node.id.name));
            }
            DependencyResolutionProcessor.createDependencyIndex(localContexts);
        }
    }

    public override postChildrenProcessing(
        { node, localContexts, globalContext, ...unusedProcessingContext }: ProcessingContext,
        childConcepts: ConceptMap,
    ): ConceptMap {
        // TODO: add destructuring assignment support
        if (node.type === AST_NODE_TYPES.VariableDeclarator && node.id.type === AST_NODE_TYPES.Identifier) {
            let init: LCEValue | undefined;
            if (node.init) {
                if (childConcepts.has(VariableDeclaratorTraverser.INIT_PROP)) {
                    const values = getAndDeleteAllValueChildConcepts(VariableDeclaratorTraverser.INIT_PROP, childConcepts);
                    if (values.length === 1) {
                        init = values[0] as LCEValue;
                    }
                } else {
                    init = new LCEValueComplex(globalContext.services.esTreeNodeToTSNodeMap.get(node.init).getText());
                }
            }

            const name = node.id.name;
            const fqn = localContexts.currentContexts.get(VariableDeclaratorProcessor.VARIABLE_DECLARATOR_FQN_CONTEXT) as FQN;
            DependencyResolutionProcessor.registerDeclaration(localContexts, name, fqn, true);

            const kind = localContexts.parentContexts?.get(VariableDeclarationProcessor.VARIABLE_DECLARATION_KIND_CONTEXT) as "var" | "let" | "const";

            const varDecl = new LCEVariableDeclaration(
                name,
                fqn,
                kind,
                parseESNodeType({ node, localContexts, globalContext, ...unusedProcessingContext }, node, name),
                init,
                CodeCoordinateUtils.getCodeCoordinates(globalContext, node, true),
            );

            return mergeConceptMaps(
                singleEntryConceptMap(LCEVariableDeclaration.conceptId, varDecl),
                DependencyResolutionProcessor.getRegisteredDependencies(localContexts),
            );
        }
        return new Map();
    }
}
