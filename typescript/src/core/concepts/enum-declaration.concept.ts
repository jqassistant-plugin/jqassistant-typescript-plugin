import {LCENamedConcept} from "../concept";
import {LCEValue} from "./value.concept";
import {CodeCoordinates} from "./code-coordinate.concept";

export class LCEEnumDeclaration extends LCENamedConcept {
    public static override conceptId = "enum-declaration";

    constructor(
        public enumName: string,
        fqn: string,
        public members: LCEEnumMember[],
        public constant: boolean,
        public declared: boolean,
        public coordinates: CodeCoordinates
    ) {
        super(fqn);
    }
}

export class LCEEnumMember extends LCENamedConcept {
    public static override conceptId = "enum-member";

    constructor(public enumMemberName: string,
                fqn: string,
                public coordinates: CodeCoordinates,
                public initValue?: LCEValue) {
        super(fqn);
    }
}
