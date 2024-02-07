import { processProjects } from "../../../src/core/extractor";
import {
    expectDeclaredType,
    expectDependency,
    expectExport,
    getDependenciesFromResult,
    initNodeSampleProject,
    resolveGlobalFqn,
} from "../../utils/test-utils";
import { LCEVariableDeclaration } from "../../../src/core/concepts/variable-declaration.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";

jest.setTimeout(30000);

describe("import/export test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/import-export";
    let result: Map<string, object[]>;
    const varDecls: Map<string, LCEVariableDeclaration> = new Map();
    const exportDecls: Map<string, LCEExportDeclaration[]> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        initNodeSampleProject(projectRootPath);
        const projects = await processProjects(projectRootPath);
        if(projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.")
        }
        result = projects[0].concepts;

        if(!result.get(LCEVariableDeclaration.conceptId)) {
            throw new Error("Could not find variable declarations in result data.")
        }
        for(const concept of (result.get(LCEVariableDeclaration.conceptId) ?? [])) {
            const varDecl: LCEVariableDeclaration = concept as LCEVariableDeclaration;
            if(!varDecl.fqn.localFqn) {
                throw new Error("Variable declaration has no local FQN " + JSON.stringify(varDecl));
            }
            if(varDecls.has(varDecl.fqn.localFqn)) {
                throw new Error("Two variable declarations with same FQN were returned: " + varDecl.fqn.localFqn);
            }
            varDecls.set(varDecl.fqn.localFqn, varDecl);
        }

        if(!result.get(LCEExportDeclaration.conceptId)) {
            throw new Error("Could not find export declarations in result data.")
        }
        for(const concept of (result.get(LCEExportDeclaration.conceptId) ?? [])) {
            const exportDecl: LCEExportDeclaration = concept as LCEExportDeclaration;
            if(!exportDecl.sourceFilePathAbsolute) {
                throw new Error("Variable declaration has no source file path " + JSON.stringify(exportDecl));
            }
            if(!exportDecls.has(exportDecl.sourceFilePathAbsolute)) {
                exportDecls.set(exportDecl.sourceFilePathAbsolute, []);
            }
            exportDecls.get(exportDecl.sourceFilePathAbsolute)?.push(exportDecl);
        }

        dependencies = getDependenciesFromResult(result);
    });

    test("direct declaration exports (source1.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, './src/source1.ts'));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(4);
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomClass', "CustomClass");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomInterface', "CustomInterface");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomType', "CustomType");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomEnum', "CustomEnum");
    });

    test("exports (source2.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, './src/source2.ts'));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomClass2', "CustomClass2");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomInterface2', "CustomInterface2");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomType2', "CustomType2", "CustomType2Alias");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomEnum2', "CustomEnum2");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".DefaultClass2', "DefaultClass2", undefined, true);
    });

    test("exports (source3.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, './src/source3.ts'));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomClass3', "CustomClass3", "CustomClass3Alias");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomInterface3', "CustomInterface3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomType3', "CustomType3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomEnum3', "CustomEnum3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".DefaultClass3', "DefaultClass3", undefined, true);
    });

    test("re-exports (reexport.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, './src/reexport.ts'));
        expect(exports).toBeDefined();
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomClass', "CustomClass");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomInterface', "CustomInterface");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomType', "CustomType");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomEnum', "CustomEnum");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, './src/source1.ts'), 1);

        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomClass2', "CustomClass2");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomClass2'), 1);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomInterface2', "CustomInterface2", "CustomInterface2Alias");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomInterface2'), 1);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomType2', "CustomType2Alias", "CustomType2AliasAlias");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomType2'), 1);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".DefaultClass2', "default", "DefaultAlias2");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".DefaultClass2'), 1);

        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomClass3', "CustomClass3Alias", "someNamespace.CustomClass3Alias");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomInterface3', "CustomInterface3", "someNamespace.CustomInterface3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomType3', "CustomType3", "someNamespace.CustomType3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomEnum3', "CustomEnum3", "someNamespace.CustomEnum3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".DefaultClass3', "default", "someNamespace.default", true);
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, './src/source3.ts'), 1);

        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source1.ts".DummyCustomInterface', "DummyCustomInterface");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomInterface'), 1);
        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source3.ts".DummyCustomClass3', "DummyCustomClass3");
        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3', "DummyCustomInterface3");
        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source3.ts".DummyDefaultClass3', "DummyDefaultClass3");
        expectDependency(projectRootPath, dependencies, './src/reexport.ts', resolveGlobalFqn(projectRootPath, '../external-dummy-project/src/source3.ts'), 1);

        expectExport(projectRootPath, exports!, '"./src/reexport.ts".SomeOtherClass', "SomeOtherClass");
        expect(exports!).toHaveLength(18);
    });

    test("imports (imports1.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v1')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomInterface3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v1', resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomInterface3'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v2')?.type, resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomClass2'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v2', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomClass2'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v3')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomClass3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v3', resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomClass3'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v4')?.type, resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomType2'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v4', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomType2'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v5')?.type, resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomInterface'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v5', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomInterface'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v6')?.type, resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomClass'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v6', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomClass'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v7')?.type, resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source2.ts".DummyCustomType2'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v7', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source2.ts".DummyCustomType2'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v8')?.type, resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomClass3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v8', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomClass3'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v9')?.type, resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".v9', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3'), 1);

        expectDeclaredType(varDecls.get('"./src/imports1.ts".d1')?.type, resolveGlobalFqn(projectRootPath, '"./src/source2.ts".DefaultClass2'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d1', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".DefaultClass2'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d2')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".DefaultClass3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d2', resolveGlobalFqn(projectRootPath, '"./src/source3.ts".DefaultClass3'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d3')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".DefaultClass3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d3', resolveGlobalFqn(projectRootPath, '"./src/source3.ts".DefaultClass3'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d4')?.type, resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyDefaultClass3'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d4', resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyDefaultClass3'), 1);

        // ensure that no module wide dependencies are present
        expect(dependencies.get('./src/imports1.ts')).toBeUndefined();
    });

    test("Node.js re-exports (reexport-node.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, './src/reexport-node.ts'));
        expect(exports).toBeDefined();
        expectExport(projectRootPath, exports!, '"cowsay".IOptions', "IOptions");
        expectDependency(projectRootPath, dependencies, './src/reexport-node.ts', 'cowsay', 1);
        expectExport(projectRootPath, exports!, '"progress".ProgressBar.ProgressBarOptions', "ProgressBar.ProgressBarOptions", "PBO");
        expectDependency(projectRootPath, dependencies, './src/reexport-node.ts', '"progress".ProgressBar.ProgressBarOptions', 1);
        expect(exports!).toHaveLength(2);
    });

    test("imports (imports2.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/imports2.ts".v1')?.type, '"progress".ProgressBar.ProgressBarOptions');
        expectDependency(projectRootPath, dependencies, '"./src/imports2.ts".v1', '"progress".ProgressBar.ProgressBarOptions', 1);
        expectDeclaredType(varDecls.get('"./src/imports2.ts".v2')?.type, '"cowsay".IOptions');
        expectDependency(projectRootPath, dependencies, '"./src/imports2.ts".v2', '"cowsay".IOptions', 1);

        // ensure that no module wide dependencies are present
        expect(dependencies.get('./src/imports2.ts')).toBeUndefined();
    });

});
