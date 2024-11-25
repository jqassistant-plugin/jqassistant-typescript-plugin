import {
    createSourceFile,
    ParsedCommandLine,
    parseJsonSourceFileConfigFileContent,
    ScriptTarget,
    sys,
    TsConfigSourceFile
} from "typescript";
import fs from "fs";
import path from "path";
import { FileUtils } from "./file.utils";

import { LCEProjectInfo } from "../project";

/**
 * Utlity class that provides functionality with regard to TypeScript projects and their configurations
 */
export class ProjectUtils {


    /**
     * Normalizes all paths contained within a `LCEProjectInfo` using `FileUtils.normalizePath`
     */
    public static normalizeProjectInfo(projectInfo: LCEProjectInfo): LCEProjectInfo {
        return {
            rootPath: FileUtils.normalizePath(projectInfo.rootPath),
            configPath: FileUtils.normalizePath(projectInfo.configPath),
            subProjectPaths: projectInfo.subProjectPaths.map(path => FileUtils.normalizePath(path)),
            sourceFilePaths: projectInfo.sourceFilePaths.map(path => FileUtils.normalizePath(path)),
            tsConfig: projectInfo.tsConfig
        }
    }

    /**
     * Scans recursively for projects inside a given directory.
     * If a project has references (via tsconfig.json) to other projects, they are also scanned (no matter if they are inside or outside the scanRoot).
     * All information about scanned projects and referenced subprojects are returned in a flat array.
     */
    public static async determineProjects(scanRoot: string): Promise<LCEProjectInfo[]> {
        const result: LCEProjectInfo[] = [];
        const dirsToScan = [path.resolve(scanRoot)];

        while(dirsToScan.length > 0) {
            const projectRoot = dirsToScan[0];
            const tsConfigPath = path.join(projectRoot, "tsconfig.json");
            if(fs.existsSync(tsConfigPath)) {
                result.push(...this.getProjectInfo(projectRoot, 'tsconfig.json'));
            } else {
                // add all subdirectories as potential project candidates
                fs.readdirSync(projectRoot).forEach(file => {
                    const subdir = path.join(projectRoot, file);
                    if (fs.statSync(subdir).isDirectory() &&
                        file !== "node_modules") {
                        dirsToScan.push(subdir);
                    }
                });
            }
            dirsToScan.splice(0, 1);
        }

        // filter out duplicates
        const seen: string[] = [];
        return result.filter(pi => {
            if(seen.includes(pi.configPath)) {
                return false;
            } else {
                seen.push(pi.configPath);
                return true;
            }
        });
    }

    private static getConfigFileName(rawConfigPath : string) {
        const pathIsADirectory = fs.statSync(rawConfigPath).isDirectory();
        const defaultConfigFileName = 'tsconfig.json';
        return pathIsADirectory? path.join(rawConfigPath, defaultConfigFileName) : rawConfigPath;
    }

    private static getProjectInfo(projectPath: string, configFileName: string): LCEProjectInfo[] {
        const result: LCEProjectInfo[] = [];
        const tsConfig = this.parseTsConfig(projectPath, configFileName);

        const subProjectPaths: string[] = [];

        if(tsConfig.projectReferences) {
            for (const ref of tsConfig.projectReferences) {
                const referencedConfigFileName = this.getConfigFileName(ref.path);
                const subProjectInfos = this.getProjectInfo(path.dirname(referencedConfigFileName), path.basename(referencedConfigFileName));
                subProjectPaths.push(...subProjectInfos.map(spi => FileUtils.normalizePath(spi.configPath)));
                result.push(...subProjectInfos);
            }
        }

        let rootPath = projectPath;
        // if project root is descendant of configured root directory use the configured one
        if(path.resolve(projectPath).startsWith(path.resolve(projectPath, tsConfig.options.rootDir!))) {
            rootPath = path.resolve(projectPath, tsConfig.options.rootDir!);
        }

        result.push({
            rootPath: FileUtils.normalizePath(rootPath),
            configPath: FileUtils.normalizePath(path.join(projectPath, configFileName)),
            subProjectPaths: subProjectPaths,
            sourceFilePaths: tsConfig.fileNames.map(fn => FileUtils.normalizePath(fn)),
            tsConfig
        });

        return result;
    }

    private static parseTsConfig(projectRoot: string, configFile: string): ParsedCommandLine {
        const tsConfigPath = path.join(projectRoot, configFile);
        const configFileText = fs.readFileSync(tsConfigPath, 'utf8');
        const configFileSourceFile = createSourceFile(
            configFile, configFileText, ScriptTarget.JSON
        );

        // Parse the tsconfig.json
        const parsedCommandLine = parseJsonSourceFileConfigFileContent(
            configFileSourceFile as TsConfigSourceFile,
            sys,
            path.dirname(tsConfigPath)
        );

        // explicitly set rootDir option to default value, if not set manually
        if (!parsedCommandLine.options.rootDir) {
            if(parsedCommandLine.options.composite || parsedCommandLine.fileNames.length === 0) {
                parsedCommandLine.options.rootDir = projectRoot;
            } else {
                parsedCommandLine.options.rootDir = FileUtils.commonDir(parsedCommandLine.fileNames);
            }
        }

        return parsedCommandLine;
    }

}
