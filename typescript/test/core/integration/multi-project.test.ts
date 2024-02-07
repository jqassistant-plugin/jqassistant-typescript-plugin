import { processProjects } from "../../../src/core/extractor";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEProject } from "../../../src/core/project";
import path from "path";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEExternalModule } from "../../../src/core/concepts/externals.concept";
import { expectDependency, expectExport, expectModule, getDependenciesFromResult, resolveGlobalFqn } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("Multi-Project test", () => {
    const scanPath = "./test/core/integration/sample-projects/multi-project";
    const projects: Map<string, LCEProject> = new Map();

    beforeAll(async () => {
        const processedProjects = await processProjects(scanPath);
        if(processedProjects.length !== 7) {
            throw new Error("Processed " + processedProjects.length + " projects. Should be 7 instead.")
        }

        for(const p of processedProjects) {
            if(projects.has(p.projectInfo.projectPath)) {
                throw new Error("Encountered processed project duplicate: " + p.projectInfo.projectPath);
            }
            projects.set(path.relative(path.resolve("./test/core/integration/sample-projects/multi-project"), p.projectInfo.projectPath), p);
        }
    });

    test("basic project (project1)", async () => {
        const project = projects.get("project1");
        expect(project).toBeDefined();
        if(project) {
            const externalModules = project.concepts.get(LCEExternalModule.conceptId);
            expect(externalModules).toBeDefined();
            expect(externalModules).toHaveLength(0);

            const [projectRootPath,
                modules,
                exportDecls,
                dependencies
            ] = extractProjectConcepts(project);

            expect(projectRootPath).toBe(project.projectInfo.projectPath);
            expect(project.projectInfo.subProjectPaths).toHaveLength(0);
            expect(project.projectInfo.sourceFilePaths).toHaveLength(2);
            expect(project.projectInfo.sourceFilePaths).toContain(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expect(project.projectInfo.sourceFilePaths).toContain(resolveGlobalFqn(projectRootPath, "./src/module2.ts"));

            expect(modules.size).toBe(2);
            expectModule(projectRootPath, modules, "./src/module1.ts", resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expectModule(projectRootPath, modules, "./src/module2.ts", resolveGlobalFqn(projectRootPath, "./src/module2.ts"));

            const mod1Exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expectExport(projectRootPath, mod1Exports!, '"./src/module1.ts".PROJECT1_EXPORT', 'PROJECT1_EXPORT');
            expectExport(projectRootPath, mod1Exports!, '"./src/module1.ts".PROJECT1_EXPORT2', 'PROJECT1_EXPORT2');
            const mod2Exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/module2.ts"));
            expectExport(projectRootPath, mod2Exports!, '"./src/module2.ts".Project1Class', 'Project1Class');
            expectExport(projectRootPath, mod2Exports!, '"./src/module2.ts".Project1Interface', 'Project1Interface');
            expectExport(projectRootPath, mod2Exports!, '"./src/module2.ts".Project1Type', 'Project1Type');

            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT1_EXPORT2', resolveGlobalFqn(projectRootPath, '"./src/module2.ts".Project1Class'), 2);
        }
    });

    test("sibling project using a common reference project (project2)", async () => {
        const project = projects.get("project2");
        expect(project).toBeDefined();
        if(project) {
            const externalModules = project.concepts.get(LCEExternalModule.conceptId);
            expect(externalModules).toBeDefined();
            expect(externalModules).toHaveLength(0);

            const [projectRootPath,
                modules,
                exportDecls,
                dependencies
            ] = extractProjectConcepts(project);

            expect(projectRootPath).toBe(project.projectInfo.projectPath);
            expect(project.projectInfo.subProjectPaths).toHaveLength(2);
            expect(project.projectInfo.subProjectPaths).toContain(resolveGlobalFqn(projectRootPath, "../subprojectCommon"));
            expect(project.projectInfo.subProjectPaths).toContain(resolveGlobalFqn(projectRootPath, "../subprojectCommon/subproject331"));
            expect(project.projectInfo.sourceFilePaths).toHaveLength(2);
            expect(project.projectInfo.sourceFilePaths).toContain(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expect(project.projectInfo.sourceFilePaths).toContain(resolveGlobalFqn(projectRootPath, "./src/module2.ts"));

            expect(modules.size).toBe(2);
            expectModule(projectRootPath, modules, "./src/module1.ts", resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expectModule(projectRootPath, modules, "./src/module2.ts", resolveGlobalFqn(projectRootPath, "./src/module2.ts"));

            const mod1Exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expectExport(projectRootPath, mod1Exports!, '"./src/module1.ts".PROJECT2_EXPORT', 'PROJECT2_EXPORT');
            expectExport(projectRootPath, mod1Exports!, '"./src/module1.ts".PROJECT2_EXPORT2', 'PROJECT2_EXPORT2');
            const mod2Exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/module2.ts"));
            expectExport(projectRootPath, mod2Exports!, '"./src/module2.ts".Project2Class', 'Project2Class');
            expectExport(projectRootPath, mod2Exports!, '"./src/module2.ts".Project2Interface', 'Project2Interface');
            expectExport(projectRootPath, mod2Exports!, '"./src/module2.ts".Project2Type', 'Project2Type');

            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT2_EXPORT', resolveGlobalFqn(projectRootPath, '"../subprojectCommon/subproject331/src/module1.ts".PROJECT_COMMON_EXPORT'), 1);
            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT2_EXPORT2', resolveGlobalFqn(projectRootPath, '"./src/module2.ts".Project2Class'), 2);
        }
    });

    test("root project using a multiple reference projects (project3)", async () => {
        const project = projects.get("project3");
        expect(project).toBeDefined();
        if(project) {
            const externalModules = project.concepts.get(LCEExternalModule.conceptId);
            expect(externalModules).toBeDefined();
            expect(externalModules).toHaveLength(0);

            const [projectRootPath,
                modules,
                exportDecls,
                dependencies
            ] = extractProjectConcepts(project);

            expect(projectRootPath).toBe(project.projectInfo.projectPath);
            expect(project.projectInfo.subProjectPaths).toHaveLength(4);
            expect(project.projectInfo.subProjectPaths).toContain(resolveGlobalFqn(projectRootPath, "./subproject31"));
            expect(project.projectInfo.subProjectPaths).toContain(resolveGlobalFqn(projectRootPath, "./subproject32"));
            expect(project.projectInfo.subProjectPaths).toContain(resolveGlobalFqn(projectRootPath, "../subprojectCommon"));
            expect(project.projectInfo.subProjectPaths).toContain(resolveGlobalFqn(projectRootPath, "../subprojectCommon/subproject331"));
            expect(project.projectInfo.sourceFilePaths).toHaveLength(1);
            expect(project.projectInfo.sourceFilePaths).toContain(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));

            expect(modules.size).toBe(1);
            expectModule(projectRootPath, modules, "./src/module1.ts", resolveGlobalFqn(projectRootPath, "./src/module1.ts"));

            const mod1Exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expectExport(projectRootPath, mod1Exports!, '"./src/module1.ts".PROJECT3_EXPORT', 'PROJECT3_EXPORT');

            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT3_EXPORT', resolveGlobalFqn(projectRootPath, '"./subproject31/src/module1.ts".PROJECT31_EXPORT'), 1);
            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT3_EXPORT', resolveGlobalFqn(projectRootPath, '"./subproject32/src/module1.ts".PROJECT32_EXPORT'), 1);
            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT3_EXPORT', resolveGlobalFqn(projectRootPath, '"../subprojectCommon/src/module1.ts".PROJECT33_EXPORT'), 1);
            expectDependency(projectRootPath, dependencies, '"./src/module1.ts".PROJECT3_EXPORT', resolveGlobalFqn(projectRootPath, '"../subprojectCommon/subproject331/src/module1.ts".PROJECT_COMMON_EXPORT'), 1);
        }
    });

    test("sub project without reference projects (project31)", async () => {
        const project = projects.get("project3/subproject31");
        expect(project).toBeDefined();
        if(project) {
            const externalModules = project.concepts.get(LCEExternalModule.conceptId);
            expect(externalModules).toBeDefined();
            expect(externalModules).toHaveLength(0);

            const [projectRootPath,
                modules,
                exportDecls
            ] = extractProjectConcepts(project);

            expect(projectRootPath).toBe(project.projectInfo.projectPath);
            expect(project.projectInfo.subProjectPaths).toHaveLength(0);
            expect(project.projectInfo.sourceFilePaths).toHaveLength(1);
            expect(project.projectInfo.sourceFilePaths).toContain(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));

            expect(modules.size).toBe(1);
            expectModule(projectRootPath, modules, "./src/module1.ts", resolveGlobalFqn(projectRootPath, "./src/module1.ts"));

            const mod1Exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/module1.ts"));
            expectExport(projectRootPath, mod1Exports!, '"./src/module1.ts".PROJECT31_EXPORT', 'PROJECT31_EXPORT');

        }
    });

});


function extractProjectConcepts(project: LCEProject): [
    string,
    Map<string, LCEModule>,
    Map<string, LCEExportDeclaration[]>,
    Map<string, Map<string, LCEDependency>>
] {
    const modules: Map<string, LCEModule> = new Map();
    for (const concept of project.concepts.get(LCEModule.conceptId) ?? []) {
        const module: LCEModule = concept as LCEModule;
        if (!module.fqn.globalFqn) {
            throw new Error("Module has no global FQN " + JSON.stringify(module));
        }
        if (modules.has(module.fqn.globalFqn)) {
            throw new Error("Two modules with same global FQN were returned: " + module.fqn.globalFqn);
        }
        modules.set(module.fqn.globalFqn, module);
    }

    const exportDecls: Map<string, LCEExportDeclaration[]> = new Map();
    for(const concept of (project.concepts.get(LCEExportDeclaration.conceptId) ?? [])) {
        const exportDecl: LCEExportDeclaration = concept as LCEExportDeclaration;
        if(!exportDecl.sourceFilePathAbsolute) {
            throw new Error("Variable declaration has no source file path " + JSON.stringify(exportDecl));
        }
        if(!exportDecls.has(exportDecl.sourceFilePathAbsolute)) {
            exportDecls.set(exportDecl.sourceFilePathAbsolute, []);
        }
        exportDecls.get(exportDecl.sourceFilePathAbsolute)?.push(exportDecl);
    }

    const dependencies = getDependenciesFromResult(project.concepts);

    return [project.projectInfo.rootPath, modules, exportDecls, dependencies];
}
