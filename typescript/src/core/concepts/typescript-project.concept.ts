import {LCEConcept} from "../concept";

export class LCETypeScriptProject extends LCEConcept {
    public static override conceptId = "typescript-project";

    constructor(public projectRoot: string) {
        super();
    }
}
