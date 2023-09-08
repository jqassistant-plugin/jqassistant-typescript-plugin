import * as fs from "fs";
import * as p from "path";

/**
 * describes the three variants of regular paths:
 * - `absolute`, e.g. "/home/user/file.txt"
 * - `relative`, e.g. "./file.txt"
 * - `node`, e.g. "fs"
 */
export type PathType = "absolute" | "relative" | "node";

export class PathUtils {
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
     * Converts an import path to a regular path relative to the project root.
     * Leaves node paths unchanged.
     * @param projectPath absolute path to project Root
     * @param path any import path
     * @param originPath project-relative path to the file where `path` is relative to (needed if `path` is relative, but not to the project root)
     * @returns relative or node version of the input path
     */
    static normalizeImportPath(projectPath: string, importPath: string, originPath?: string): string {
        const pathType = this.getPathType(importPath);
        if (pathType === "absolute") {
            return this.normalize(projectPath, this.addFileEnding(importPath));
        } else if (pathType === "relative" && originPath) {
            return this.normalize(
                projectPath,
                this.addFileEnding(p.resolve(projectPath, originPath.slice(0, originPath.lastIndexOf("/")), importPath))
            );
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
     * @param sourceFilePath relative path to the source file of the symbol
     * @returns normalized FQN with relative/node module path
     */
    static normalizeTypeCheckerFQN(projectPath: string, tcFQN: string, sourceFilePath: string): string {
        if (tcFQN.startsWith('"')) {
            const normFqn = this.toFQN(
                this.normalizeImportPath(projectPath, this.extractFQNPath(tcFQN))) + tcFQN.slice(tcFQN.lastIndexOf('"') + 1
            )
            return normFqn.replace(/\\/g, "/"); // ensure Windows compatibility
        } else {
            return this.toFQN(sourceFilePath) + "." + tcFQN;
        }
    }

    /**
     * converts a path to a FQN path
     */
    static toFQN(path: string): string {
        return '"' + (path.replace(/\\/g, "/")) + '"';
    }

    /**
     * extracts regular path from the given FQN
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
     * @param path relative or node regular path
     * @returns whether the path is outside the project or not
     */
    static isExternal(path: string): boolean {
        const pathType = this.getPathType(path);
        if (pathType === "node") {
            return true;
        } else if (pathType === "relative") {
            return path.startsWith("..");
        }
        return true;
    }
}
