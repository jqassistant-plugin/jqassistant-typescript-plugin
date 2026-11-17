import { processProjects } from "../../../src/core/extractor";
import { expectDependency, getDependenciesFromResult, resolveGlobalFqn } from "../../utils/test-utils";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";

jest.setTimeout(30000);

describe("import/export with ECMAScript module specifiers test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/import-export-esm";
    const exportDecls: Map<string, LCEExportDeclaration[]> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }
        const result = projects[0].concepts;

        for (const concept of result.get(LCEExportDeclaration.conceptId) ?? []) {
            const exportDecl = concept as LCEExportDeclaration;
            if (!exportDecls.has(exportDecl.sourceFilePathAbsolute)) {
                exportDecls.set(exportDecl.sourceFilePathAbsolute, []);
            }
            exportDecls.get(exportDecl.sourceFilePathAbsolute)!.push(exportDecl);
        }

        dependencies = getDependenciesFromResult(result);
    });

    const expectExportByName = (exports: LCEExportDeclaration[], exportedName: string, identifier: string, localDeclFqn: string) => {
        const exp = exports.find((e) => (e.alias ?? e.identifier) === exportedName);
        expect(exp).toBeDefined();
        expect(exp!.identifier).toBe(identifier);
        expect(exp!.globalDeclFqn).toBe(resolveGlobalFqn(projectRootPath, localDeclFqn));
        expect(exp!.isDefault).toBe(false);
    };

    test("re-exports with .js and .mjs specifiers (lib/index.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/lib/index.ts"));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(3);
        expectExportByName(exports!, "A", "A", '"./src/lib/a.ts".A');
        expectExportByName(exports!, "helper", "helper", '"./src/lib/a.ts".helper');
        expectExportByName(exports!, "b", "b", '"./src/lib/b.mts".b');

        const moduleDependencies = dependencies.get(resolveGlobalFqn(projectRootPath, "./src/lib/index.ts"));
        expect(moduleDependencies?.size).toBe(2);
        expectDependency(projectRootPath, dependencies, "./src/lib/index.ts", resolveGlobalFqn(projectRootPath, "./src/lib/a.ts"), 1);
        expectDependency(projectRootPath, dependencies, "./src/lib/index.ts", resolveGlobalFqn(projectRootPath, '"./src/lib/b.mts".b'), 1);
    });

    test("re-exports with .js and .mjs specifiers and an explicit index (barrel.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/barrel.ts"));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExportByName(exports!, "RenamedA", "A", '"./src/lib/a.ts".A');
        expectExportByName(exports!, "b", "b", '"./src/lib/b.mts".b');
        expectExportByName(exports!, "lib.A", "A", '"./src/lib/a.ts".A');
        expectExportByName(exports!, "lib.helper", "helper", '"./src/lib/a.ts".helper');
        expectExportByName(exports!, "lib.b", "b", '"./src/lib/b.mts".b');

        const moduleDependencies = dependencies.get(resolveGlobalFqn(projectRootPath, "./src/barrel.ts"));
        expect(moduleDependencies?.size).toBe(3);
        expectDependency(projectRootPath, dependencies, "./src/barrel.ts", resolveGlobalFqn(projectRootPath, '"./src/lib/a.ts".A'), 1);
        expectDependency(projectRootPath, dependencies, "./src/barrel.ts", resolveGlobalFqn(projectRootPath, "./src/lib/b.mts"), 1);
        expectDependency(projectRootPath, dependencies, "./src/barrel.ts", resolveGlobalFqn(projectRootPath, "./src/lib/index.ts"), 1);
    });
});
