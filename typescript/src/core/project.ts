import { LCEConcept } from "./concept";

/**
 * Represents basic information about a TypeScript project, its source files and references to all subprojects
 */
export interface LCEProjectInfo {

    /**
     * Either identical to `projectPath`, or, if configured in the `tsconfig.json`, the absolute path to the `rootDir`.
     * All local FQNs are relative to this path.
     * Multiple projects may have the same root path.
     */
    rootPath: string;

    /**
     * The absolute path to the directory containing the tsconfig.json (it may be equal to or a subdirectory to `rootPath`)
     * This path is unique for every project.
     */
    projectPath: string;

    /**
     * The absolute paths to all subprojects (including transitive ones) that have a `tsconfig.json`.
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
            projectPath: this.projectInfo.projectPath,
            subProjectPaths: this.projectInfo.subProjectPaths,
            sourceFilePaths: this.projectInfo.sourceFilePaths,
            concepts: Object.fromEntries(jsonConcepts)
        }
    }
}
