import { LCENamedConcept } from "../concept";
import { FQN } from "../context";

/**
 * Represents a module that exists outside the processed projects
 */
export class LCEExternalModule extends LCENamedConcept {
    public static override conceptId = "external-module";

    constructor(
        globalFqn: string,
        public declarations: LCEExternalDeclaration[]
    ) {
        super(new FQN(globalFqn));
    }
}

export class LCEExternalDeclaration extends LCENamedConcept {
    public static override conceptId = "external-declaration";

    constructor(
        globalFqn: string,
        public name: string
    ) {
        super(new FQN(globalFqn));
    }
}

