import {AST_NODE_TYPES} from "@typescript-eslint/types";

import {GENERATORS, PROCESSORS, TRAVERSERS} from "../core/features";
import {SimpleTraverser} from "../core/traverser";
import {ReactComponentGenerator} from "./generators/react-component.generator";
import {ReactHookGenerator} from "./generators/react-hook.generator";
import {ReactHookProcessor} from "./processors/react-hook.processor";
import {
    JSXAttributeTraverser,
    JSXElementTraverser,
    JSXExpressionContainerTraverser,
    JSXOpeningElementTraverser,
    JSXSpreadAttributeTraverser,
    JSXSpreadChildTraverser,
} from "./traversers/jsx.traverser";

export function initializeReactExtractor() {
    console.log("Initializing React Extractor...");

    TRAVERSERS.set(AST_NODE_TYPES.JSXElement, new JSXElementTraverser());
    TRAVERSERS.set(AST_NODE_TYPES.JSXEmptyExpression, new SimpleTraverser());
    TRAVERSERS.set(AST_NODE_TYPES.JSXOpeningElement, new JSXOpeningElementTraverser());
    TRAVERSERS.set(AST_NODE_TYPES.JSXAttribute, new JSXAttributeTraverser());
    TRAVERSERS.set(AST_NODE_TYPES.JSXSpreadAttribute, new JSXSpreadAttributeTraverser());
    TRAVERSERS.set(AST_NODE_TYPES.JSXSpreadChild, new JSXSpreadChildTraverser());
    TRAVERSERS.set(AST_NODE_TYPES.JSXExpressionContainer, new JSXExpressionContainerTraverser());

    PROCESSORS.push(new ReactHookProcessor());

    GENERATORS.push(new ReactComponentGenerator());
    GENERATORS.push(new ReactHookGenerator());
}
