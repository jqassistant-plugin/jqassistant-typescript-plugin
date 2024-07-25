import * as fs from "fs";
import * as path from "path";

/**
 * Utility class that provides functionality with regard to file system interactions and the handling of file system paths.
 */
export class FileUtils {

    /**
     * Normalizes a path, so that every '\' is replaced by a '/'
     * This function should be used to convert all externally provided paths into a coherent internal representation.
     */
    public static normalizePath(path: string) {
        return path.replace(/\\/g, "/");
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

    /**
     * Determines the common directory for a list of paths.
     */
    public static commonDir(paths: string[]): string {
        if (paths.length === 0) throw new Error("Provide a non-empty list of paths to determine the common path");

        if(paths.length === 1) {
            if(fs.statSync(paths[0]).isFile()) {
                return path.dirname(paths[0]);
            }
        }

        let commonSegments = paths[0].split(path.sep);

        for (const filePath of paths) {
            const segments = filePath.split(path.sep);
            commonSegments = commonSegments.slice(0, segments.length);

            for (let i = 0; i < segments.length; i++) {
                if (commonSegments[i] !== segments[i]) {
                    commonSegments = commonSegments.slice(0, i);
                    break;
                }
            }
        }
        return commonSegments.join(path.sep);
    }
}
