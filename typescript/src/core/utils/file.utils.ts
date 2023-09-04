import * as fs from "fs";
import * as path from "path";
import { match } from "minimatch";
import json5 from "json5";

export class FileUtils {
    /**
     * Returns the paths for all project source files with a given ending inside a directory. (scans recursively)
     * @param projectPath path to the directory that shall be scanned
     * @returns
     */
    static getProjectSourceFileList(projectPath: string): string[] {
        const tsconfig: {
            include?: string[];
            exclude?: string[];
        } = json5.parse(fs.readFileSync(path.join(projectPath, "tsconfig.json"), "utf8"));
        // CommonJS (.cts) files are ignored
        const endings = [".ts", ".tsx", ".mts"];

        const defaultIgnoredDirs = [".git", "node_modules"];

        if (tsconfig.include) tsconfig.include = tsconfig.include.map((dirPattern) => path.join(projectPath, dirPattern).replace(/\\/g, "/"));
        if (tsconfig.exclude) tsconfig.exclude = tsconfig.exclude.map((dirPattern) => path.join(projectPath, dirPattern).replace(/\\/g, "/"));

        const allFiles = FileUtils.getAllFiles(projectPath, [], tsconfig.include ? [] : defaultIgnoredDirs);
        return allFiles.filter((file) => {
            let matched = false;
            let included = true;
            if (tsconfig.include) {
                if (tsconfig.include.find((dirPattern) => match([file], dirPattern).length > 0 || file.replace(/\\/g, "/").startsWith(dirPattern))) {
                    if (
                        tsconfig.exclude &&
                        tsconfig.exclude.find(
                            (dirPattern) => match([file], dirPattern, { dot: true }).length > 0 || file.replace(/\\/g, "/").startsWith(dirPattern),
                        )
                    ) {
                        included = false;
                    }
                } else {
                    included = false;
                }
            }

            if (included) {
                for (const e of endings) {
                    if (file.endsWith(e)) {
                        matched = true;
                        break;
                    }
                }
            } else {
                return false;
            }

            return matched;
        });
    }

    /**
     * Returns a list of paths to all files within a directory and all its subdirectories.
     *
     * @param dirPath absolute path to the directory of which all files should be listed
     * @param arrayOfFiles used for recursion (just leave empty on call)
     * @param ignoredDirs directories to ignore
     */
    public static getAllFiles(dirPath: string, arrayOfFiles: string[] = [], ignoredDirs: string[] = []): string[] {
        const files = fs.readdirSync(dirPath);

        files.forEach(function (file) {
            if (fs.statSync(path.join(dirPath, file)).isDirectory() && !ignoredDirs.includes(file)) {
                FileUtils.getAllFiles(path.join(dirPath, file), arrayOfFiles, ignoredDirs);
            } else {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        });

        return arrayOfFiles;
    }
}
