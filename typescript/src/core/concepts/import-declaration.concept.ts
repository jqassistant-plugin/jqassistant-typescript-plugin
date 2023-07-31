import {LCEConcept} from "../concept";

export class LCEImportDeclaration extends LCEConcept {
    public static override conceptId = "import-declaration";

    constructor(
        public identifier: string,
        public alias: string | undefined,
        public importSource: string,
        public sourceInProject: boolean,
        public isDefault: boolean,
        public kind: "value" | "type" | "namespace",
        public sourceFilePath: string
    ) {
        super();
    }
}
