import { LCENamedConcept } from "../../core/concept";
import { FQN } from "../../core/context";

export class LCEJSXDependency extends LCENamedConcept {
    public static override conceptId = "jsx-dependency";

    constructor(
        fqn: FQN,
        public name: string,
        public cardinality: number,
    ) {
        super(fqn);
    }
}
