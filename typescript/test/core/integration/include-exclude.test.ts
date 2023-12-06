import { processProject } from "../../../src/core/extractor";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { expectModule } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("tsconfig include/exclude test", () => {
    let result: Map<string, object[]>;
    const modules: Map<string, LCEModule> = new Map();
    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/include-exclude";
        result = await processProject(projectRoot);

        if (!result.get(LCEModule.conceptId)) {
            throw new Error("Could not find modules in result data.");
        }

        for (const concept of result.get(LCEModule.conceptId) ?? []) {
            const module: LCEModule = concept as LCEModule;
            if (!module.fqn) {
                throw new Error("Module has no fqn " + JSON.stringify(module));
            }
            if (modules.has(module.fqn)) {
                throw new Error("Two modules with same FQN were returned: " + module.fqn);
            }
            modules.set(module.fqn, module);
        }
    });

    test("included modules are present", async () => {
        expect([...modules.keys()]).toHaveLength(7);
        expectModule(modules, "./root-included.ts", "/root-included.ts");
        expectModule(modules, "./src/src-included.ts", "/src/src-included.ts");
        expectModule(modules, "./src/src-included-2.tsx", "/src/src-included-2.tsx");
        expectModule(modules, "./src/nested/src-nested-included.ts", "/src/nested/src-nested-included.ts");
        expectModule(modules, "./src2/src2-included.ts", "/src2/src2-included.ts");
        expectModule(modules, "./src4/src4-included.ts", "/src4/src4-included.ts");
        expectModule(modules, "./src4/nested/src4-nested-included.ts", "/src4/nested/src4-nested-included.ts");
    });

    test("excluded modules are not present", async () => {
        expectModule(modules, "./root-excluded.ts", "", false);
        expectModule(modules, "./src/excluded/src-excluded.ts", "", false);
        expectModule(modules, "./src2/nested/src2-nested-excluded.ts", "", false);
        expectModule(modules, "./src3/src3-excluded.ts", "", false);
        expectModule(modules, "./src3/nested/src3-nested-excluded.ts", "", false);
    });
});
