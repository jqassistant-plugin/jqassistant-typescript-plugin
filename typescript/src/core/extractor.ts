import { parseAndGenerateServices } from "@typescript-eslint/typescript-estree";
import * as fs from "fs";
import path from "path";
import { TypeChecker } from "typescript";

import { ConceptMap, LCEConcept, mergeConceptMaps, singleEntryConceptMap, unifyConceptMap } from "./concept";
import { LCEProject } from "./concepts/typescript-project.concept";
import { GlobalContext } from "./context";
import { PathUtils } from "./path.utils";
import { AstTraverser } from "./traversers/ast.traverser";
import { Utils } from "./utils";
import { POST_PROCESSORS } from "./features";

// eslint-disable-next-line @typescript-eslint/ban-types
export async function processProject(projectRoot: string, readFile: Function = fs.readFileSync): Promise<Map<string, LCEConcept[]>> {
    // TODO: take tsconfig.json into consideration (assumes projectRoot = path that contains tsconfig.json)
    // see https://www.typescriptlang.org/docs/handbook/project-references.html#what-is-a-project-reference

    projectRoot = path.resolve(projectRoot);
    const fileList = Utils.getProjectSourceFileList(projectRoot);

    // maps filenames to the extracted concepts from these files
    let concepts: ConceptMap = singleEntryConceptMap(LCEProject.conceptId, new LCEProject(projectRoot.replace(/\\/g, "/")));

    console.log("Analyzing " + fileList.length + " project files...");
    const startTime = process.hrtime();

    // Traverse and process all individual project files
    const traverser = new AstTraverser();
    for (const file of fileList) {
        const code: string = readFile(file, "utf8");
        const {ast, services} = parseAndGenerateServices(code, {
            loc: true,
            range: true,
            tokens: false,
            filePath: file,
            project: path.join(projectRoot, "tsconfig.json"),
        });
        if(!services.program) {
            continue;
        }
        const typeChecker: TypeChecker = services.program.getTypeChecker();

        const globalContext: GlobalContext = {
            projectRootPath: projectRoot.replace(/\\/g, "/"),
            sourceFilePath: PathUtils.normalize(projectRoot, file).replace(/\\/g, "/"),
            ast: ast,
            services: services,
            typeChecker: typeChecker,
        };

        concepts = mergeConceptMaps(concepts, unifyConceptMap(traverser.traverse(globalContext), globalContext.sourceFilePath));
    }
    const normalizedConcepts = unifyConceptMap(concepts, "").get("") ?? new Map();

    // Post-process for project-wide concepts
    for(const postProcessor of POST_PROCESSORS) {
        postProcessor.postProcess(normalizedConcepts);
    }

    const endTime = process.hrtime();
    console.log("Finished analyzing project files. Runtime: " + (endTime[0] - startTime[0]) + "s");

    return normalizedConcepts;
}

export async function processAndOutputResult(projectRoot: string, readFile: Function = fs.readFileSync) {
    // process project
    const normalizedConcepts = await processProject(projectRoot, readFile);

    // output JSON file
    if (normalizedConcepts) {
        const json = JSON.stringify(Object.fromEntries(normalizedConcepts), (_, value) => {
            if(typeof  value === 'bigint') {
                return value.toString();
            } else if(typeof value === 'object' && value instanceof Map) {
                return Object.fromEntries(Array.from(value.entries()))
            } else {
                return value;
            }

        }, 2);
        let dirPath = path.join(projectRoot, ".reports", "jqa");
        let filePath = path.join(dirPath, 'ts-output.json');
        fs.mkdir(dirPath, {recursive: true}, (errDir) => {
            if (errDir) {
                console.log("Could not create directory: " + dirPath);
            } else {
                fs.writeFile(filePath, json, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("JSON result successfully written to " + filePath);
                    }
                });
            }
        })

    }
}
