import { POST_PROCESSORS } from "../core/features";
import { ReactComponentPostProcessor } from "./post-processors/react-component.post-processor";

export function initializeReactExtractor() {
    console.log("Initializing React Extractor...");

    // just for demo purposes:
    // PROCESSORS.push(new ReactHookProcessor());

    POST_PROCESSORS.push(new ReactComponentPostProcessor());
}
