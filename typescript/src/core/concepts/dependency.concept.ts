import {LCENamedConcept} from "../concept";

export type FQNType = "declaration" | "module";

export class LCEDependency extends LCENamedConcept {
    public static override conceptId = "dependency";

    constructor(
        fqn: string, // target fqn
        public targetType: FQNType,
        public sourceFQN: string,
        public sourceType: FQNType,
        public cardinality: number
    ) {
        super(fqn);
    }
}
