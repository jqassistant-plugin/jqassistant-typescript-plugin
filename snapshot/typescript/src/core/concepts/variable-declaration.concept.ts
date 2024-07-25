import { LCENamedConcept } from "../concept";
import { LCEType } from "./type.concept";
import { LCEValue } from "./value.concept";
import { CodeCoordinates } from "./code-coordinate.concept";
import { FQN } from "../context";

export class LCEVariableDeclaration extends LCENamedConcept {
    public static override conceptId = "variable-declaration";

    constructor(
        public variableName: string,
        fqn: FQN,
        public kind: "var" | "let" | "const",
        public type: LCEType,
        public initValue: LCEValue | undefined,
        public coordinates: CodeCoordinates,
    ) {
        super(fqn);
    }
}
