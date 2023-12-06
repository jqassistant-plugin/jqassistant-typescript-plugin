import { AST_NODE_TYPES } from "@typescript-eslint/utils";

import { ConceptMap, singleEntryConceptMap } from "../concept";
import { ProcessingContext } from "../context";
import { ExecutionCondition } from "../execution-condition";
import { Processor } from "../processor";
import { LCEModule } from "../concepts/typescript-module.concept";
import { PathUtils } from "../utils/path.utils";

export class ModuleProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.Program], () => true);

    public override postChildrenProcessing({ globalContext, node }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.Program) {
            const module = new LCEModule(globalContext.sourceFilePath, PathUtils.toGraphPath(globalContext.sourceFilePath));
            return singleEntryConceptMap(LCEModule.conceptId, module);
        }
        return new Map();
    }
}
