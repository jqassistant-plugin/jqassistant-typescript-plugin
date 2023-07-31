import {LCEConcept} from "../concept";

export class LCEProject extends LCEConcept {
    public static override conceptId = "project";

    constructor(public projectRoot: string) {
        super();
    }
}
