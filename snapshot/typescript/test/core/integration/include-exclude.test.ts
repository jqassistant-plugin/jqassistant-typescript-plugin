import { processProjects } from "../../../src/core/extractor";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { expectModule, resolveGlobalFqn } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("(single-project) tsconfig include/exclude test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/include-exclude";
    let result: Map<string, object[]>;
    const modules: Map<string, LCEModule> = new Map();
    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if(projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.")
        }
        result = projects[0].concepts;

        if (!result.get(LCEModule.conceptId)) {
            throw new Error("Could not find modules in result data.");
        }

        for (const concept of result.get(LCEModule.conceptId) ?? []) {
            const module: LCEModule = concept as LCEModule;
            if (!module.fqn.globalFqn) {
                throw new Error("Module has no global FQN " + JSON.stringify(module));
            }
            if (modules.has(module.fqn.globalFqn)) {
                throw new Error("Two modules with same global FQN were returned: " + module.fqn.globalFqn);
            }
            modules.set(module.fqn.globalFqn, module);
        }
    });

    test("included modules are present", async () => {
        expect([...modules.keys()]).toHaveLength(7);
        expectModule(projectRootPath, modules, "./root-included.ts", resolveGlobalFqn(projectRootPath, "./root-included.ts"));
        expectModule(projectRootPath, modules, "./src/src-included.ts", resolveGlobalFqn(projectRootPath, "./src/src-included.ts"));
        expectModule(projectRootPath, modules, "./src/src-included-2.tsx", resolveGlobalFqn(projectRootPath, "./src/src-included-2.tsx"));
        expectModule(projectRootPath, modules, "./src/nested/src-nested-included.ts", resolveGlobalFqn(projectRootPath, "./src/nested/src-nested-included.ts"));
        expectModule(projectRootPath, modules, "./src2/src2-included.ts", resolveGlobalFqn(projectRootPath, "./src2/src2-included.ts"));
        expectModule(projectRootPath, modules, "./src4/src4-included.ts", resolveGlobalFqn(projectRootPath, "./src4/src4-included.ts"));
        expectModule(projectRootPath, modules, "./src4/nested/src4-nested-included.ts", resolveGlobalFqn(projectRootPath, "./src4/nested/src4-nested-included.ts"));
    });

    test("excluded modules are not present", async () => {
        expectModule(projectRootPath, modules, "./root-excluded.ts", "", false);
        expectModule(projectRootPath, modules, "./src/excluded/src-excluded.ts", "", false);
        expectModule(projectRootPath, modules, "./src2/nested/src2-nested-excluded.ts", "", false);
        expectModule(projectRootPath, modules, "./src3/src3-excluded.ts", "", false);
        expectModule(projectRootPath, modules, "./src3/nested/src3-nested-excluded.ts", "", false);
    });
});
