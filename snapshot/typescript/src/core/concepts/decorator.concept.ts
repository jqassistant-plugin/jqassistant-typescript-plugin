import {LCEConcept} from "../concept";
import {LCEValue} from "./value.concept";
import {CodeCoordinates} from "./code-coordinate.concept";

export class LCEDecorator extends LCEConcept {
    public static override conceptId = "decorator";

    constructor(public value: LCEValue,
                public coordinates: CodeCoordinates) {
        super();
    }
}
