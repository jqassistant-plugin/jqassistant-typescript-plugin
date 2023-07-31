import {LCENamedConcept} from "../concept";
import {LCEValue} from "./value.concept";

export class LCEEnumDeclaration extends LCENamedConcept {
    public static override conceptId = "enum-declaration";

    constructor(
        public enumName: string,
        fqn: string,
        public members: LCEEnumMember[],
        public constant: boolean,
        public declared: boolean,
        public sourceFilePath: string
    ) {
        super(fqn);
    }
}

export class LCEEnumMember extends LCENamedConcept {
    public static override conceptId = "enum-member";

    constructor(public enumMemberName: string, fqn: string, public init?: LCEValue) {
        super(fqn);
    }
}
