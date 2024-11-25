import { LCEConcept } from "./concept";
import {
    ModuleDetectionKind,
    ModuleKind,
    ModuleResolutionKind,
    NewLineKind,
    ParsedCommandLine,
    ScriptTarget
} from "typescript";

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

    /**
     * Object representing the natively resolved tsconfig.json
     */
    tsConfig: ParsedCommandLine;
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
            tsConfig: this.tsConfigToJSON(),
            concepts: Object.fromEntries(jsonConcepts)
        }
    }

    /**
     * converts the natively resolved tsconfig object to a human-readable JSON object with enum values replaced with their respective names
     */
    private tsConfigToJSON(): object {
        const options = this.projectInfo.tsConfig.options;
        const result: any = structuredClone(options)
        if(options.module) {
            result.module = ModuleKind[options.module];
        }
        if(options.moduleResolution) {
            result.moduleResolution = ModuleResolutionKind[options.moduleResolution];
        }
        if(options.moduleDetection) {
            result.moduleDetection = ModuleDetectionKind[options.moduleDetection];
        }
        if(options.newLine) {
            result.newLine = NewLineKind[options.newLine];
        }
        if(options.target) {
            result.target = ScriptTarget[options.target];
        }
        return result;
    }
}
