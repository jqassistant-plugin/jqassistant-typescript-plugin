import { POST_PROCESSORS, PROCESSORS } from "../core/features";
import { ReactComponentPostProcessor } from "./post-processors/react-component.post-processor";
import { JSXDependencyContextProcessor, JSXDependencyProcessor } from "./processors/jsx-dependency.processor";

export function initializeReactExtractor() {
    console.log("Initializing React Extension...");

    // just for demo purposes:
    // PROCESSORS.push(new ReactHookProcessor());

    PROCESSORS.push(new JSXDependencyContextProcessor());
    PROCESSORS.push(new JSXDependencyProcessor());

    POST_PROCESSORS.push(new ReactComponentPostProcessor());
}
