import {LCEConcept} from "../../core/concept";

export class LCEReactStateHook extends LCEConcept {
    public static override conceptId = "react-state-hook";

    constructor(public componentFqn: string, public propName: string, public setterName: string) {
        super();
    }
}
