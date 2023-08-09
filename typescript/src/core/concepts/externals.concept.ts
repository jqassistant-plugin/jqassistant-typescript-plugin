import {LCENamedConcept} from "../concept";

export class LCEExternalModule extends LCENamedConcept {
    public static override conceptId = "external-module";

    constructor(
        fqn: string,
        public declarations: LCEExternalDeclaration[]
    ) {
        super(fqn);
    }
}

export class LCEExternalDeclaration extends LCENamedConcept {
    public static override conceptId = "external-declaration";

    constructor(
        fqn: string,
        public name: string
    ) {
        super(fqn);
    }
}

