import {LCEConcept} from "../concept";

export class LCEExportDeclaration extends LCEConcept {
    public static override conceptId = "export-declaration";

    constructor(
        public identifier: string,
        public alias: string | undefined,
        public declFqn: string | undefined,
        public importSource: string | undefined,
        public sourceInProject: boolean | undefined,
        public isDefault: boolean,
        public kind: "value" | "type" | "namespace",
        public sourceFilePath: string
    ) {
        super();
    }
}
