import { PROCESSORS } from "../core/features";
import { ReactHookProcessor } from "./processors/react-hook.processor";

export function initializeReactExtractor() {
    console.log("Initializing React Extractor...");

    PROCESSORS.push(new ReactHookProcessor());
}
