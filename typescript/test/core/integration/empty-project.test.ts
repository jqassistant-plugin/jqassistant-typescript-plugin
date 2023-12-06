import { processProject } from "../../../src/core/extractor";
import { LCEProject } from "../../../src/core/concepts/typescript-project.concept";
import path from "path";

jest.setTimeout(30000);

describe("empty project test", () => {
    const projectRoot = "./test/core/integration/sample-projects/empty";
    let result: Map<string, object[]>;

    beforeAll(async () => {
        result = await processProject(projectRoot);
    });

    test("project concept present", async () => {
        let projects = result.get(LCEProject.conceptId);
        expect(projects).toBeDefined();
        expect(projects).toHaveLength(1);
        const project = (projects![0]) as LCEProject;
        expect(project.projectRoot).toBe(path.resolve(projectRoot).replace(/\\/g, "/"));
    });
});
