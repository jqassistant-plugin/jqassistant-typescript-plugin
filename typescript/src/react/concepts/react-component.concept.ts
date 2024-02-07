import { LCENamedConcept } from "../../core/concept";
import { LCEJSXDependency } from "./react-jsx-dependency";
import { FQN } from "../../core/context";

export class LCEReactComponent extends LCENamedConcept {
    public static override conceptId = "react-component";

    constructor(
        fqn: FQN,
        public componentName: string,
        public renderedElements: LCEJSXDependency[],
    ) {
        super(fqn);
    }
}
