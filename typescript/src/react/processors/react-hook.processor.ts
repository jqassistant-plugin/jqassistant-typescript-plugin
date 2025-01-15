import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { ConceptMap, singleEntryConceptMap } from "../../core/concept";
import { ProcessingContext } from "../../core/context";
import { ExecutionCondition } from "../../core/execution-condition";
import { Processor } from "../../core/processor";
import { LCEReactStateHook } from "../concepts/react-hook.concept";
import { CoreContextKeys } from "../../core/context.keys";

export class ReactHookProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.VariableDeclarator], () => true);

    public override postChildrenProcessing({ node, localContexts }: ProcessingContext): ConceptMap {
        if (
            node.type === AST_NODE_TYPES.VariableDeclarator &&
            node.init &&
            node.init.type === AST_NODE_TYPES.CallExpression &&
            node.init.callee.type === AST_NODE_TYPES.Identifier &&
            node.init.callee.name.startsWith("use")
        ) {
            const hookName = node.init.callee.name;

            if (
                hookName === "useState" &&
                node.id.type === AST_NODE_TYPES.ArrayPattern &&
                node.id.elements[0] &&
                node.id.elements[0].type === AST_NODE_TYPES.Identifier &&
                node.id.elements[1] &&
                node.id.elements[1].type === AST_NODE_TYPES.Identifier
            ) {
                const fqn = localContexts.getNextContext(CoreContextKeys.DEPENDENCY_GLOBAL_SOURCE_FQN)?.[0] as string;
                return singleEntryConceptMap(
                    LCEReactStateHook.conceptId,
                    new LCEReactStateHook(fqn, node.id.elements[0].name, node.id.elements[1].name),
                );
            }
        }
        return new Map();
    }
}
