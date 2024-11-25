import { processProjects } from "../../../src/core/extractor";

jest.setTimeout(30000);

describe("tsconfig.json test", () => {
    const scanPath = "./test/core/integration/sample-projects/tsconfig";
    let result: any;

    beforeAll(async () => {
        const processedProjects = await processProjects(scanPath);
        if (processedProjects.length !== 1) {
            throw new Error("Processed " + processedProjects.length + " projects. Should be 1 instead.");
        }

        result = processedProjects[0].toJSON();
    });

    test("check resolved tsconfig json", async () => {
        expect(result).toBeDefined();
        expect(result.tsConfig).toBeDefined();
        const tsConfig = result.tsConfig;

        // check values inherited from base.json
        expect(tsConfig.target).toBe("Latest");
        expect(tsConfig.experimentalDecorators).toBe(true);

        // check values of tsconfig.json
        expect(tsConfig.paths).toBeDefined();
        expect(tsConfig.paths["@internal"]).toBeDefined();
        expect(tsConfig.paths["@internal"]).toHaveLength(1);
        expect(tsConfig.paths["@internal"][0]).toBe("src/internal");
        expect(tsConfig.paths["@internal/*"]).toBeDefined();
        expect(tsConfig.paths["@internal/*"]).toHaveLength(1);
        expect(tsConfig.paths["@internal/*"][0]).toBe("src/internal/*");

        expect(tsConfig.module).toBe("CommonJS");
        expect(tsConfig.esModuleInterop).toBe(true);
        expect(tsConfig.forceConsistentCasingInFileNames).toBe(true);
        expect(tsConfig.strict).toBe(true);
        expect(tsConfig.skipLibCheck).toBe(true);
    });
});
