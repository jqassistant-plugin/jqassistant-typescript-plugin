import * as fs from "fs";
import * as p from "path";
import path from "path";
import { FQN } from "../context";
import { LCEProject, LCEProjectInfo } from "../project";
import { LCEModule } from "../concepts/typescript-module.concept";
import { FileUtils } from "./file.utils";
import { glob } from "glob";

/**
 * describes the three variants of regular paths:
 * - `absolute`, e.g. "/home/user/file.txt"
 * - `relative`, e.g. "./file.txt"
 * - `node`, e.g. "fs"
 */
export type PathType = "absolute" | "relative" | "node";

/**
 * Utility class that provides functionality regarding the paths of TypeScript modules, like they occur in import statements.
 */
export class ModulePathUtils {
    /**
     * @param path regular or import path
     * @returns type of the given path
     */
    static getPathType(path: string): PathType {
        if (p.isAbsolute(path)) {
            return "absolute";
        } else if (path.startsWith(".") && !path.replace(/\\/g, "/").startsWith("./node_modules")) {
            return "relative";
        } else {
            return "node";
        }
    }

    /**
     * Converts any regular path to a regular path relative to the project root.
     * Leaves node paths unchanged.
     * @param projectPath absolute path to project Root
     * @param path any regular path
     * @param originPath project-relative path to the file where `path` is relative to (needed if `path` is relative, but not to the project root)
     * @returns relative or node version of the input path
     */
    static normalize(projectPath: string, path: string, originPath?: string): string {
        const pathType = this.getPathType(path);
        if (pathType === "node") {
            return path;
        } else {
            let relPath;
            if (pathType === "absolute") {
                relPath = p.relative(projectPath, path).replace(/\\/g, "/");
            } else {
                if (!originPath) throw new Error("originPath is required if path is relative");
                relPath = p.relative(projectPath, p.resolve(projectPath, originPath.slice(0, originPath.lastIndexOf("/")), path)).replace(/\\/g, "/");
            }

            if (!relPath.startsWith(".")) {
                return "./" + relPath;
            } else {
                return relPath;
            }
        }
    }

    /**
     * Converts an import path to an absolute regular path.
     * Leaves node paths unchanged.
     * @param projectRootPath absolute path to project Root
     * @param importPath any import path
     * @param originPath project-relative path to the file where `path` is relative to (needed if `path` is relative, but not to the project root)
     * @returns absolute or node version of the input path
     */
    static normalizeImportPath(projectRootPath: string, importPath: string, originPath?: string): string {
        const pathType = this.getPathType(importPath);
        if (pathType === "absolute") {
            return FileUtils.normalizePath(this.addFileEnding(importPath));
        } else if (pathType === "relative" && originPath) {
            return FileUtils.normalizePath(this.addFileEnding(p.resolve(projectRootPath, originPath.slice(0, originPath.lastIndexOf("/")), importPath)));
        } else {
            return importPath;
        }
    }

    private static addFileEnding(absoluteFilePath: string): string {
        if (fs.existsSync(absoluteFilePath)) {
            return absoluteFilePath;
        } else if (fs.existsSync(absoluteFilePath + ".ts")) {
            return absoluteFilePath + ".ts";
        } else if (fs.existsSync(absoluteFilePath + ".tsx")) {
            return absoluteFilePath + ".tsx";
        } else if (fs.existsSync(absoluteFilePath + ".mts")) {
            return absoluteFilePath + ".mts";
        } else if (fs.existsSync(absoluteFilePath + ".js")) {
            return absoluteFilePath + ".js";
        } else if (fs.existsSync(absoluteFilePath + ".jsx")) {
            return absoluteFilePath + ".jsx";
        } else if (fs.existsSync(absoluteFilePath + ".mjs")) {
            return absoluteFilePath + ".mjs";
        } else if (fs.existsSync(absoluteFilePath + ".d.ts")) {
            return absoluteFilePath + ".d.ts";
        } else if (fs.existsSync(absoluteFilePath + ".d.mts")) {
            return absoluteFilePath + ".d.mts";
        }
        return absoluteFilePath;
    }

    /**
     * @param projectPath absolute path to project Root
     * @param tcFQN FQN obtained using `getFullyQualifiedName(symbol)` of TS TypeChecker
     * @param sourceFilePathAbsolute absolute path to the source file of the symbol
     * @returns normalized FQN with absolute/node module path
     */
    static normalizeTypeCheckerFQN(tcFQN: string, sourceFilePathAbsolute: string): string {
        if (tcFQN.startsWith('"')) {
            const fqnPath = this.extractFQNPath(tcFQN);
            const pathType = this.getPathType(fqnPath);
            if(pathType === "node") {
                return tcFQN;
            } else if(pathType === "absolute") {
                let sourceFileName = this.addFileEnding(fqnPath);

                // re-introduce case-sensitive naming in Windows platforms
                if(process.platform === "win32") {
                    sourceFileName = glob.sync(sourceFileName)[0];
                }

                // remove index.* filename from FQN path
                if(sourceFileName.match(/\/index\.[a-z]+$/)){
                    sourceFileName = sourceFileName.replace(/\/index\.[a-z]+$/, "");
                }

                return (`"${sourceFileName}"${tcFQN.slice(tcFQN.lastIndexOf('"') + 1)}`).replace(/\\/g, "/");
            } else {
                throw new Error("Encountered relative TypeChecker FQN path: " + tcFQN);
            }
        } else {
            return this.toFQN(sourceFilePathAbsolute).globalFqn + "." + tcFQN;
        }
    }

    /**
     * Converts a global and, optionally, local path to their corresponding FQN path representation.
     * Use relative paths for local FQNs and absolute paths for global FQNs.
     */
    static toFQN(globalPath: string, localPath?: string): FQN {
        const indexSourceFileRegEx = /\/index\.\w+/;
        const basicGlobalFQN = '"' + (globalPath.replace(/\\/g, "/")) + '"';
        const basicLocalFQN = localPath ? '"' + (localPath.replace(/\\/g, "/")) + '"' : "";

        return new FQN(
            basicGlobalFQN.replace(indexSourceFileRegEx, ""),
            basicLocalFQN.replace(indexSourceFileRegEx, "")
        );
    }

    /**
     * Extracts a regular path from the given FQN
     */
    static extractFQNPath(fqn: string): string {
        if (fqn.startsWith('"')) {
            return fqn.slice(1, fqn.lastIndexOf('"'));
        } else {
            return "";
        }
    }

    /**
     * extracts the identifier part of an FQN
     */
    static extractFQNIdentifier(fqn: string): string {
        if (fqn.startsWith('"')) {
            return fqn.slice(fqn.lastIndexOf('"') + 2);
        } else {
            return fqn;
        }
    }

    /**
     * @returns whether the provided FQN is a module or not
     */
    static isFQNModule(fqn: string): boolean {
        return fqn.startsWith('"') && fqn.endsWith('"');
    }

    /**
     * converts a regular path into a path for the graph
     */
    static toGraphPath(path: string): string {
        if (path.startsWith(".")) {
            return path.substring(1);
        } else {
            return path;
        }
    }

    /**
     * NOTE: This function can only be used after all projects have been processed.
     *
     * @param modulePath absolute, relative, or node path
     * @param projectInfo ProjectInfo of the project that is currently being post-processed
     * @param projects list of all processed projects
     * @returns whether the path is outside the project (or one of its subprojects) or not
     */
    static isExternal(modulePath: string, projectInfo: LCEProjectInfo, projects: LCEProject[]): boolean {
        let moduleIndex: ModuleIndex | undefined = this.moduleIndexes.get(projectInfo.projectPath);
        if(!moduleIndex) {
            moduleIndex = new Map();
            // create module index by registering all processed modules for project and all subprojects
            for(const subproject of projects) {
                if(!projectInfo.subProjectPaths.includes(subproject.projectInfo.projectPath) && subproject.projectInfo.projectPath !== projectInfo.projectPath) {
                    continue;
                }

                const modules = subproject.concepts.get(LCEModule.conceptId) as LCEModule[];
                for (const module of modules) {
                    moduleIndex.set(module.fqn.globalFqn, true);
                }
            }
            this.moduleIndexes.set(projectInfo.projectPath, moduleIndex)
        }

        const pathType = this.getPathType(modulePath);
        if (pathType === "node") {
            return true;
        } else if (pathType === "relative") {
            return !moduleIndex.get(path.resolve(projectInfo.rootPath, modulePath));
        } else {
            return !moduleIndex.get(modulePath);
        }
    }

    /**
     * Used for caching module indexes used for isExternal()
     * Maps projectPaths to ModuleIndex maps
     */
    private static moduleIndexes: Map<string, ModuleIndex> = new Map();
}

/**
 * Used for storing information about which modules are contained within a project (or its subprojects)
 * modulePathAbsolute -> whether the module path is part of the project
 */
type ModuleIndex = Map<string, boolean>;
