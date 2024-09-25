import { parseAndGenerateServices } from "@typescript-eslint/typescript-estree";
import * as fs from "fs";
import path from "path";
import { TypeChecker } from "typescript";
import { Presets, SingleBar } from "cli-progress";

import { ConceptMap, LCEConcept, mergeConceptMaps, unifyConceptMap } from "./concept";
import { GlobalContext } from "./context";
import { ModulePathUtils } from "./utils/modulepath.utils";
import { AstTraverser } from "./traversers/ast.traverser";
import { FileUtils } from "./utils/file.utils";
import { POST_PROCESSORS } from "./features";
import { ProjectUtils } from "./utils/project.utils";
import { LCEProject, LCEProjectInfo } from "./project";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ExtractorOptions {
    prettyPrint?: boolean;
}

export async function processProjectsAndOutputResult(scanRoot: string, options: ExtractorOptions) {
    const processedProjects = await processProjects(scanRoot);

    // output JSON file
    const json = JSON.stringify(
        processedProjects.map((p) => p.toJSON()),
        (_, value) => {
            if (typeof value === "bigint") {
                return value.toString();
            } else if (typeof value === "object" && value instanceof Map) {
                return Object.fromEntries(Array.from(value.entries()));
            } else {
                return value;
            }
        },
        options.prettyPrint ? 2 : undefined,
    );

    let dirPath = path.join(scanRoot, ".reports", "jqa");
    let filePath = path.join(dirPath, "ts-output.json");
    fs.mkdir(dirPath, { recursive: true }, (errDir) => {
        if (errDir) {
            console.log("Could not create directory: " + dirPath);
        } else {
            fs.writeFile(filePath, json, (err) => {
                if (err) {
                    console.log("Error writing JSON: " + err);
                } else {
                    console.log("JSON result successfully written to " + filePath);
                }
            });
        }
    });
}

export async function processProjects(scanRoot: string): Promise<LCEProject[]> {
    // determine projects to scan
    const projects = await ProjectUtils.determineProjects(scanRoot);

    // process projects
    const processedProjects: LCEProject[] = [];
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        console.log("Processing project " + (i + 1) + " of " + projects.length);
        processedProjects.push(await processProject(project));
    }

    // post-processing projects
    console.log("Post-Processing Results...");
    for (const postProcessor of POST_PROCESSORS) {
        postProcessor.postProcess(processedProjects);
    }

    return processedProjects;
}

export async function processProject(project: LCEProjectInfo): Promise<LCEProject> {
    const projectNorm = ProjectUtils.normalizeProjectInfo(project);
    const projectRoot = project.rootPath;
    const fileList = project.sourceFilePaths;

    // maps filenames to the extracted concepts from these files
    let concepts: ConceptMap = new Map();

    console.log("Analyzing " + fileList.length + " project files...");
    const startTime = process.hrtime();
    let fileReadingTime = 0;
    const progressBar = new SingleBar({}, Presets.shades_classic);
    progressBar.start(fileList.length, 0);

    // Traverse and process all individual project files
    const traverser = new AstTraverser();
    for (let i = 0; i < fileList.length; i++) {
        progressBar.update(i + 1);
        const file = fileList[i];

        const frStartTime = process.hrtime();
        const code: string = fs.readFileSync(file, "utf8");
        const frEndTime = process.hrtime();
        fileReadingTime += frEndTime[0] + frEndTime[1] / 10 ** 9 - (frStartTime[0] + frStartTime[1] / 10 ** 9);

        try {
            const { ast, services } = parseAndGenerateServices(code, {
                loc: true,
                range: true,
                tokens: false,
                filePath: file,
                project: project.configPath,
            });
            if (!services.program) {
                continue;
            }
            const typeChecker: TypeChecker = services.program.getTypeChecker();

            const globalContext: GlobalContext = {
                projectInfo: projectNorm,
                sourceFilePathAbsolute: FileUtils.normalizePath(file),
                sourceFilePathRelative: FileUtils.normalizePath(ModulePathUtils.normalize(projectRoot, file)),
                ast: ast,
                services: services,
                typeChecker: typeChecker,
            };

            concepts = mergeConceptMaps(concepts, unifyConceptMap(traverser.traverse(globalContext), globalContext.sourceFilePathAbsolute));
        } catch (e) {
            console.log("Error occurred while processing file: " + file);
            console.log(e);
        }
    }
    progressBar.stop();
    const normalizedConcepts: Map<string, LCEConcept[]> = unifyConceptMap(concepts, "").get("") ?? new Map();

    const endTime = process.hrtime();
    const diffTime = endTime[0] + endTime[1] / 10 ** 9 - (startTime[0] + startTime[1] / 10 ** 9);
    console.log("Finished analyzing project files.");
    console.log("Runtime: " + diffTime.toFixed(3) + "s (" + fileReadingTime.toFixed(3) + "s reading files)");

    return new LCEProject(project, normalizedConcepts);
}
