import { ProjectUtils } from "../../../src/core/utils/project.utils";

describe("ProjectUtils", () => {

    describe("determineProjects", () => {
        
        it("should resolve tsconfig file and directory path references", async () => {
            const projectRootPath = "./test/core/integration/sample-projects/path-references";
            const projects = await ProjectUtils.determineProjects(projectRootPath);
            expect(projects).toHaveLength(2);
        });
    });
});
