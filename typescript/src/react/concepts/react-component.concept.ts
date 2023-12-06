import { LCENamedConcept } from "../../core/concept";
import { LCEJSXDependency } from "./react-jsx-dependency";

export class LCEReactComponent extends LCENamedConcept {
    public static override conceptId = "react-component";

    constructor(
        fqn: string,
        public componentName: string,
        public renderedElements: LCEJSXDependency[],
    ) {
        super(fqn);
    }
}
