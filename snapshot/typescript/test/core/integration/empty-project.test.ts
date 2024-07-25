import { processProjects } from "../../../src/core/extractor";

jest.setTimeout(30000);

describe("empty project test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/empty";

    test("project concept present", async () => {
        const projects = await processProjects(projectRootPath);
        expect(projects).toHaveLength(1);
    });
});
