import { LCENamedConcept } from "../../core/concept";

export class LCEReactComponent extends LCENamedConcept {
    public static override conceptId = "react-component";

    constructor(
        fqn: string,
        public componentName: string,
        public classComponent: boolean,
    ) {
        super(fqn);
    }
}
