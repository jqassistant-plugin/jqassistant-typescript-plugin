import { LCENamedConcept } from "../../core/concept";

export class LCEJSXDependency extends LCENamedConcept {
    public static override conceptId = "jsx-dependency";

    constructor(
        fqn: string,
        public name: string,
        public cardinality: number,
    ) {
        super(fqn);
    }
}
