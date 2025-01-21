import {LocalContexts} from "../context";
import {CoreContextKeys} from "../context.keys";
import {TraverserContext} from "../traverser";

export let DEBUG_LOGGING = false;

export function setDebugLogging(enableDebugLogging: boolean): void {
    DEBUG_LOGGING = enableDebugLogging;
}

export function debug(logMessage: string): void {
    if(DEBUG_LOGGING) {
        console.debug(logMessage);
    }
}

export function debugTraversalStack(localContexts: LocalContexts): void {
    if(DEBUG_LOGGING) {
        let astPos  = "";
        for(const lc of localContexts.contexts) {
            const coordNum = (lc.get(CoreContextKeys.TRAVERSER_CONTEXT) as TraverserContext).parentPropIndex;
            const coordName = (lc.get(CoreContextKeys.TRAVERSER_CONTEXT) as TraverserContext).parentPropName;
            astPos = astPos + "/" + coordName + (coordNum !== undefined ? "[" + coordNum + "]" : "");
        }
        console.debug(astPos)
    }
}
