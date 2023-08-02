import {LCEConcept} from "../concept";

export class LCEModule extends LCEConcept {
    public static override conceptId = "module";

    constructor(public path: string) {
        super();
    }
}
