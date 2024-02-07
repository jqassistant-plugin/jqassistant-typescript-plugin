import { processProjects } from "../../../src/core/extractor";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { expectDependency, getDependenciesFromResult, initNodeSampleProject, resolveGlobalFqn } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("Node.js dependencies test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/node-dependencies";
    let result: Map<string, object[]>;
    let deps: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        initNodeSampleProject(projectRootPath);
        const projects = await processProjects(projectRootPath);
        if(projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.")
        }
        result = projects[0].concepts;
        deps = getDependenciesFromResult(result);
    });

    test("main module dependencies", async () => {
        expectDependency(projectRootPath, deps, '"./src/main.ts".CustomClass.saySthExternal', resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'), 1);
        expectDependency(projectRootPath, deps, '"./src/main.ts".CustomClass.saySthExternal', resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass.saySth'), 1);
        expectDependency(projectRootPath, deps, '"./src/main.ts".OtherClass.thinkSth', '"cowsay".think', 1);
    });

    test("secondary module dependencies", async () => {
        expectDependency(projectRootPath, deps, '"./src/secondary.ts".ExternalCustomClass.saySth', '"cowsay".say', 2);
    });
});
