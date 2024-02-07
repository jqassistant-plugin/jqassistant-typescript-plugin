import { LCENamedConcept } from "../concept";
import { FQN } from "../context";

export type FQNType = "declaration" | "module";

export class LCEDependency extends LCENamedConcept {
    public static override conceptId = "dependency";

    constructor(
        globalTargetFqn: string,
        public targetType: FQNType,
        public globalSourceFQN: string,
        public sourceType: FQNType,
        public cardinality: number
    ) {
        super(new FQN(globalTargetFqn));
    }
}
