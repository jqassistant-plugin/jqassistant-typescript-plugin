import {Session} from "neo4j-driver";

import {getAndCastConcepts, LCEConcept} from "../concept";
import {LCETypeScriptProject} from "../concepts/typescript-project.concept";
import {Generator} from "../generator";

export class TypeScriptProjectFilesGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>): Promise<void> {
        console.log("Marking TypeScript project files in graph...");

        const project = getAndCastConcepts<LCETypeScriptProject>(LCETypeScriptProject.conceptId, concepts)[0];
        await neo4jSession.run(
            `
            MATCH (root:Directory {fileName: $projectRoot})-[:CONTAINS]->(sourceFile:File)
            WHERE NOT (sourceFile:Directory) AND (sourceFile.fileName ENDS WITH '.ts' OR sourceFile.fileName ENDS WITH '.tsx')
            SET root:TS:Project
            SET sourceFile:TS:Module
            RETURN root
            `,
            {projectRoot: project.projectRoot}
        );

        await neo4jSession.run(
            `
            MATCH (configFile:File:Json {fileName: '/tsconfig.json'})
            SET configFile:TS:ProjectConfiguration
            RETURN configFile
            `,
            {projectRoot: project.projectRoot}
        );
    }
}
