import { LCEConcept } from "./concept";

/**
 * Represents basic information about a TypeScript project, its source files and references to all subprojects
 */
export interface LCEProjectInfo {

    /**
     * Either identical to directory path containing the `tsconfig.json`, or, if configured in the `tsconfig.json`, the absolute path to the `rootDir`.
     * All local FQNs are relative to this path.
     * Multiple projects may have the same root path.
     */
    rootPath: string;

    /**
     * The absolute path to the `tsconfig.json` (may have different name) of the project
     * This path is unique for every project.
     */
    configPath: string;

    /**
     * The absolute paths to all `tsconfig.json` files of subprojects (including transitive ones).
     * The term "subproject" is used synonymous to project references defined in the `tsconfig.json` of the main project.
     */
    subProjectPaths: string[];

    /**
     * List of absolute paths to all source files contained in the project (excluding subprojects).
     */
    sourceFilePaths: string[];
}

/**
 * Represents a TypeScript project along with all concepts contained within it.
 */
export class LCEProject {
    constructor(public projectInfo: LCEProjectInfo,
                public concepts: Map<string, LCEConcept[]>) {
    }

    toJSON(): object {
        const jsonConcepts: Map<string, object[]> = new Map();
        this.concepts.forEach((value, key) => {
            jsonConcepts.set(key, value.map(i => i.toJSON()))
        })

        return {
            rootPath: this.projectInfo.rootPath,
            configPath: this.projectInfo.configPath,
            subProjectPaths: this.projectInfo.subProjectPaths,
            sourceFilePaths: this.projectInfo.sourceFilePaths,
            concepts: Object.fromEntries(jsonConcepts)
        }
    }
}
