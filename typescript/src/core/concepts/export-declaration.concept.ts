import { LCEConcept } from "../concept";

export class LCEExportDeclaration extends LCEConcept {
    public static override conceptId = "export-declaration";

    /**
     * @param identifier identifier of the exported declaration
     * @param alias optional alias that may be specified within the export statement
     * @param globalDeclFqn if available: global FQN of the exported declaration (FQN uses re-exporting module path for re-exports)
     * @param importSource import source (can be a node path or an absolute path)
     * @param isDefault whether the export is a default export or a standard named export
     * @param kind type of the export: "value" is used for declarations, "type" indicates a type alias export and "namespace" a "*" export
     * @param sourceFilePathAbsolute absolute path of the source file in which the processed export statement is located
     */
    constructor(
        public identifier: string,
        public alias: string | undefined,
        public globalDeclFqn: string | undefined,
        public importSource: string | undefined,
        public isDefault: boolean,
        public kind: "value" | "type" | "namespace",
        public sourceFilePathAbsolute: string,
    ) {
        super();
    }
}
