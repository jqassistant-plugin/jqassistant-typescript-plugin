import { processProject } from "../../../src/core/extractor";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { expectDependency, getDependenciesFromResult, initNodeSampleProject } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("Node.js dependencies test", () => {
    let result: Map<string, object[]>;
    let deps: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/node-dependencies";
        initNodeSampleProject(projectRoot);
        result = await processProject(projectRoot);
        deps = getDependenciesFromResult(result);
    });

    test("main module dependencies", async () => {
        expectDependency(deps, '"./src/main.ts".CustomClass.saySthExternal', '"./src/secondary.ts".ExternalCustomClass', 1);
        expectDependency(deps, '"./src/main.ts".CustomClass.saySthExternal', '"./src/secondary.ts".ExternalCustomClass.saySth', 1);
        expectDependency(deps, '"./src/main.ts".OtherClass.thinkSth', '"cowsay".think', 1);
    });

    test("secondary module dependencies", async () => {
        expectDependency(deps, '"./src/secondary.ts".ExternalCustomClass.saySth', '"cowsay".say', 2);
    });
});
