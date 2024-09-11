import { ModulePathUtils } from "./modulepath.utils";
import path from "path";
import { FileUtils } from "./file.utils";
import * as fs from "fs";
import ts, { ParsedCommandLine } from "typescript";
import { LCEProjectInfo } from "../project";

export class NodeUtils {
    private static packageMappings = new Map();

    /**
     * maps project root paths to a map of additional paths to be considered for resolving import paths
     */
    private static tsConfigs: Map<string, ParsedCommandLine> = new Map();

    /**
     * Tries to determine the Node.js package name for a given source file path.
     * Tries to resolve @types/* packages to their implementation counterparts.
     */
    public static getPackageNameForPath(projectRootPath: string, pathToPackageFile: string): string | undefined {
        if (ModulePathUtils.getPathType(pathToPackageFile) === "node") {
            return pathToPackageFile;
        }
        if (ModulePathUtils.getPathType(pathToPackageFile) === "relative") {
            pathToPackageFile = path.resolve(projectRootPath, pathToPackageFile);
        }
        const packagePath = fs.realpathSync.native(path.dirname(pathToPackageFile));
        if (this.packageMappings.has(packagePath)) {
            return this.packageMappings.get(packagePath)!;
        }

        let currentPath = packagePath;
        while (currentPath !== projectRootPath && !path.relative(projectRootPath, currentPath).startsWith("..")) {
            const allFiles = FileUtils.getAllFiles(currentPath).map((f) => FileUtils.normalizePath(f));
            for (const file of allFiles) {
                if (path.basename(file) === "package.json") {
                    const data = fs.readFileSync(file, "utf8");
                    const json = JSON.parse(data);

                    let packageName = json["name"];
                    if (packageName && typeof packageName === "string") {
                        if (packageName.startsWith("@types/")) {
                            packageName = packageName.substring(7); // remove @types/ prefix
                        }
                        this.packageMappings.set(packagePath, packageName);
                        return packageName;
                    }
                }
            }
            currentPath = path.dirname(currentPath);
        }
    }

    /**
     * Tries to resolve the given import path.
     * Uses TypeScript module resolver first and `require.resolve` as a fallback.
     *
     * NOTE: Throws Error on failure of both resolution methods.
     */
    public static resolveImportPath(importPath: string, projectInfo: LCEProjectInfo, sourceFilePathAbsolute: string): string {
        if (!this.tsConfigs.has(projectInfo.configPath)) {
            this.tsConfigs.set(projectInfo.configPath, this.parseTsConfig(projectInfo.configPath));
        }
        const tsconfig = this.tsConfigs.get(projectInfo.configPath)!;

        let tsResolvedModule: string | undefined;
        try {
            const module = ts.resolveModuleName(importPath, sourceFilePathAbsolute, tsconfig.options, this.moduleResolutionHost);
            tsResolvedModule = module.resolvedModule?.resolvedFileName;
        } catch (e) {}
        if (tsResolvedModule) {
            return FileUtils.normalizePath(tsResolvedModule);
        } else {
            let jsResolvedModule: string | undefined;
            try {
                jsResolvedModule = require.resolve(importPath, { paths: [projectInfo.rootPath] });
            } catch (e) {}
            if (jsResolvedModule) {
                return FileUtils.normalizePath(jsResolvedModule);
            } else {
                throw new Error(`Could not resolve import: ${importPath}`);
            }
        }
    }

    private static moduleResolutionHost: ts.ModuleResolutionHost = {
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        realpath: ts.sys.realpath,
        directoryExists: ts.sys.directoryExists,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getDirectories: ts.sys.getDirectories,
    };

    private static parseTsConfig(configPath: string): ParsedCommandLine {
        const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
        const parseConfigHost: ts.ParseConfigHost = {
            useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
            readDirectory: ts.sys.readDirectory,
            fileExists: ts.sys.fileExists,
            readFile: ts.sys.readFile,
        };

        return ts.parseJsonConfigFileContent(configFile.config, parseConfigHost, path.dirname(configPath), {});
    }
}
