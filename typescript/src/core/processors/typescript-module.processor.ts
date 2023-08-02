import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {ConceptMap, mergeConceptMaps, singleEntryConceptMap} from "../concept";
import {LCETypeAliasDeclaration} from "../concepts/type-alias-declaration.concept";
import {ProcessingContext} from "../context";
import {ExecutionCondition} from "../execution-condition";
import {Processor} from "../processor";
import {DependencyResolutionProcessor} from "./dependency-resolution.processor";
import {parseESNodeType, parseTypeAliasTypeParameters} from "./type.utils";
import {CodeCoordinateUtils} from "./code-coordinate.utils";
import {LCEModule} from "../concepts/typescript-module.concept";
import {PathUtils} from "../path.utils";

export class ModuleProcessor extends Processor {

    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [AST_NODE_TYPES.Program],
        () => true
    );

    public override postChildrenProcessing({globalContext, localContexts, node}: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.Program) {
            const module = new LCEModule(PathUtils.toGraphPath(globalContext.sourceFilePath));
            return singleEntryConceptMap(LCEModule.conceptId, module);
        }
        return new Map();
    }
}
