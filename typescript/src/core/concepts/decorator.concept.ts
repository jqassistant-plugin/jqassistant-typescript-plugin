import {LCEConcept} from "../concept";
import {LCEValue} from "./value.concept";

export class LCEDecorator extends LCEConcept {
    public static override conceptId = "decorator";

    constructor(public value: LCEValue) {
        super();
    }
}
