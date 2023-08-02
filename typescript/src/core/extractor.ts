import {parseAndGenerateServices} from "@typescript-eslint/typescript-estree";
import * as fs from "fs";
import path from "path";
import {TypeChecker} from "typescript";

import {ConceptMap, mergeConceptMaps, singleEntryConceptMap, unifyConceptMap} from "./concept";
import {LCEProject} from "./concepts/typescript-project.concept";
import {GlobalContext} from "./context";
import {PathUtils} from "./path.utils";
import {AstTraverser} from "./traversers/ast.traverser";
import {Utils} from "./utils";

// eslint-disable-next-line @typescript-eslint/ban-types
export async function processProject(projectRoot: string, readFile: Function = fs.readFileSync) {
    // TODO: take tsconfig.json into consideration (assumes projectRoot = path that contains tsconfig.json)
    // see https://www.typescriptlang.org/docs/handbook/project-references.html#what-is-a-project-reference

    projectRoot = path.resolve(projectRoot);
    const fileList = Utils.getProjectSourceFileList(projectRoot);

    // maps filenames to the extracted concepts from these files
    let concepts: ConceptMap = singleEntryConceptMap(LCEProject.conceptId, new LCEProject(projectRoot));

    console.log("Analyzing " + fileList.length + " project files...");
    const startTime = process.hrtime();

    const traverser = new AstTraverser();

    for (const file of fileList) {
        const code: string = readFile(file, "utf8");
        const {ast, services} = parseAndGenerateServices(code, {
            loc: true,
            range: true,
            tokens: false,
            filePath: file,
            project: projectRoot + "/tsconfig.json",
        });
        const typeChecker: TypeChecker = services.program.getTypeChecker();

        const globalContext: GlobalContext = {
            projectRootPath: projectRoot,
            sourceFilePath: PathUtils.normalize(projectRoot, file),
            ast: ast,
            services: services,
            typeChecker: typeChecker,
        };

        concepts = mergeConceptMaps(concepts, unifyConceptMap(traverser.traverse(globalContext), file.replace(globalContext.projectRootPath, ".")));
    }

    const endTime = process.hrtime();
    console.log("Finished analyzing project files. Runtime: " + (endTime[0] - startTime[0]) + "s");

    const normalizedConcepts = unifyConceptMap(concepts, "").get("");

    if (normalizedConcepts) {
        const json = JSON.stringify(Object.fromEntries(normalizedConcepts), (_, value) => typeof value === 'bigint' ? value.toString() : value);
        let dirPath = path.join(projectRoot, "build");
        let filePath = path.join(dirPath, 'jqa-ts-output.json');
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
