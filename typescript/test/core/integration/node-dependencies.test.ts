import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { expectDependency, getDependenciesFromResult } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("Node.js dependencies test", () => {
    let result: Map<string, LCEConcept[]>;
    let deps: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/node-dependencies";
        result = await processProject(projectRoot);
        deps = getDependenciesFromResult(result);
    });

    test("main module dependencies", async () => {
        expectDependency(deps, '"./src/main.ts".CustomClass.saySthExternal', '"./src/secondary.ts".ExternalCustomClass', 1);
        expectDependency(deps, '"./src/main.ts".CustomClass.saySthExternal', '"./src/secondary.ts".ExternalCustomClass.saySth', 1);
        expectDependency(deps, '"./src/main.ts".OtherClass.thinkSth', '"./node_modules/cowsay/index.js".think', 1);
    });

    test("secondary module dependencies", async () => {
        expectDependency(deps, '"./src/secondary.ts".ExternalCustomClass.saySth', '"./node_modules/cowsay/index.js".say', 2);
    });
});
