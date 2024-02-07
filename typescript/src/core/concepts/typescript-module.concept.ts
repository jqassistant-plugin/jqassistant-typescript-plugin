import { LCENamedConcept } from "../concept";
import { FQN } from "../context";

export class LCEModule extends LCENamedConcept {
    public static override conceptId = "module";

    /**
     * @param fqn FQN containing the absolute (global) and relative (to the project root) (local) paths of the module
     * @param path is the relative (to the project root) path of the module converted to jQA graph form (without the ".")
     */
    constructor(
        fqn: FQN,
        public path: string,
    ) {
        super(fqn);
    }
}
