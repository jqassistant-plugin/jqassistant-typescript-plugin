import {LCENamedConcept} from "../concept";
import {LCEType} from "./type.concept";
import {LCEValue} from "./value.concept";
import {CodeCoordinates} from "./code-coordinate.concept";

export class LCEVariableDeclaration extends LCENamedConcept {
    public static override conceptId = "variable-declaration";

    constructor(
        public variableName: string,
        fqn: string,
        public kind: "var" | "let" | "const",
        public type: LCEType,
        public initValue: LCEValue | undefined,
        public coordinates: CodeCoordinates
    ) {
        super(fqn);
    }
}
