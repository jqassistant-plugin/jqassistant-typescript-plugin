import { ProjectUtils } from "../../../src/core/utils/project.utils";
import { processProjects } from "../../../src/core/extractor";

describe("ProjectUtils", () => {
    describe("determineProjects", () => {
        it("should resolve tsconfig file and directory path references", async () => {
            const projectRootPath = "./test/core/integration/sample-projects/path-references";
            const projects = await processProjects(projectRootPath);
            expect(projects).toHaveLength(4);
        });
    });
});
