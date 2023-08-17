import * as fs from "fs";
import * as path from "path";
import { match } from "minimatch";
import json5 from "json5";

export class Utils {
    /**
     * Returns the paths for all project source files with a given ending inside a directory. (scans recursively)
     * @param projectPath path to the directory that shall be scanned
     * @param endings whitelist of endings of files that should
     * @param ignoredDirs directories that should not be scanned
     * @returns
     */
    static getProjectSourceFileList(projectPath: string): string[] {
        const tsconfig: {
            include?: string[];
            exclude?: string[];
        } = json5.parse(fs.readFileSync(path.join(projectPath, "tsconfig.json"), "utf8"));
        const endings = [".ts", ".tsx"];

        const ignoredDirs = [".git", "node_modules"];

        // TODO: ignore node_modules, unless explicitly included in tsconfig.json
        // if (!tsconfig.include?.find((dirPattern) => dirPattern.includes("node_modules") || match(["node_modules"], dirPattern).length > 0)) {
        //     ignoredDirs.push("node_modules");
        // }

        if (tsconfig.include) tsconfig.include = tsconfig.include.map((dirPattern) => path.join(projectPath, dirPattern));
        if (tsconfig.exclude) tsconfig.exclude = tsconfig.exclude.map((dirPattern) => path.join(projectPath, dirPattern));

        const allFiles = Utils.getAllFiles(projectPath, [], ignoredDirs);
        return allFiles.filter((file) => {
            let matched = false;
            let included = true;
            if (tsconfig.include) {
                if (tsconfig.include.find((dirPattern) => match([file], dirPattern).length > 0 || file.startsWith(dirPattern))) {
                    if (
                        tsconfig.exclude &&
                        tsconfig.exclude.find((dirPattern) => match([file], dirPattern).length > 0 || file.startsWith(dirPattern))
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

    private static getAllFiles(dirPath: string, arrayOfFiles: string[] = [], ignoredDirs: string[] = []): string[] {
        const files = fs.readdirSync(dirPath);

        files.forEach(function (file) {
            if (fs.statSync(path.join(dirPath, file)).isDirectory() && !ignoredDirs.includes(file)) {
                Utils.getAllFiles(path.join(dirPath, file), arrayOfFiles, ignoredDirs);
            } else {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        });

        return arrayOfFiles;
    }
}
