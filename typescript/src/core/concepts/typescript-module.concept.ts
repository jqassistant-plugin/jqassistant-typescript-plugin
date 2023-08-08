import {LCENamedConcept} from "../concept";

export class LCEModule extends LCENamedConcept {
    public static override conceptId = "module";

    constructor(fqn: string, public path: string) {
        super(fqn);
    }
}
