import { PathUtils } from "./path.utils";
import path from "path";
import { FileUtils } from "./file.utils";
import * as fs from "fs";

export class NodeUtils {
    private static packageMappings = new Map<string, string>();

    /**
     * Tries to determine the Node.js package name for a given source file path.
     * Tries to resolve @types/* packages to their implementation counterparts.
     */
    public static getPackageNameForPath(projectRootPath: string, pathToPackageFile: string): string | undefined {
        if (PathUtils.getPathType(pathToPackageFile) === "relative") {
            pathToPackageFile = path.resolve(projectRootPath, pathToPackageFile);
        }
        const packagePath = path.dirname(pathToPackageFile);
        if (this.packageMappings.has(packagePath)) {
            return this.packageMappings.get(packagePath)!;
        }

        let currentPath = packagePath;
        while (currentPath !== projectRootPath && !path.relative(projectRootPath, currentPath).startsWith("..")) {
            const allFiles = FileUtils.getAllFiles(currentPath);
            for (const file of allFiles) {
                if (path.basename(file) === "package.json") {
                    const data = fs.readFileSync(file, "utf8");
                    const json = JSON.parse(data);

                    let packageName = json["name"];
                    if (packageName && typeof packageName === "string") {
                        if (packageName.startsWith("@types/")) {
                            packageName = packageName.substring(7); // remove types prefix
                        }
                        this.packageMappings.set(packagePath, packageName);
                        return packageName;
                    } else {
                        console.log("Error: could not find package name for node package: " + packagePath);
                    }
                }
            }
            currentPath = path.dirname(currentPath);
        }
    }
}
