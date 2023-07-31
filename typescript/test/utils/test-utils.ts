import { exec } from "child_process";
import { auth as neo4jAuth, Driver, driver as neo4jDriver, Session } from "neo4j-driver";
import path from "path";
import { promisify } from "util";

const asyncExec = promisify(exec);

/**
 * Prepares the database for the tests.
 * Sets up the reset mechanism.
 * @param sampleProjectPath path to the sample project (e.g. "language-concept-extractor/test/core/sample-project")
 */
export async function prepareDB(sampleProjectPath: string) {
    console.log("Preparing DB...");
    const { stdout, stderr } = await asyncExec("cd .. && sh ./run-jqa.sh " + sampleProjectPath);
}

export function mockFiles(projectRoot: string, files: Map<string, string>): (file: string) => string {
    return (file: string) => {
        return files.get(file.replace(projectRoot, ".")) ?? "";
    };
}

export function setupNeo4j(): { driver: Driver; session: Session } {
    const driver = neo4jDriver("bolt://localhost:7687", neo4jAuth.basic("neo4j", "neo"));
    const session = driver.session();
    return { driver, session };
}

export function teardownNeo4j({ session, driver }: { session: Session; driver: Driver }) {
    session.close();
    driver.close();
}
