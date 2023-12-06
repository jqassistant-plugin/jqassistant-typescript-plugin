import { processProject } from "../../../src/core/extractor";
import { expectDeclaredType, expectDependency, expectExport, getDependenciesFromResult, initNodeSampleProject } from "../../utils/test-utils";
import { LCEVariableDeclaration } from "../../../src/core/concepts/variable-declaration.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { DefaultAlias2 } from "./sample-projects/import-export/src/reexport";

jest.setTimeout(30000);

describe("import/export test", () => {
    let result: Map<string, object[]>;
    const varDecls: Map<string, LCEVariableDeclaration> = new Map();
    const exportDecls: Map<string, LCEExportDeclaration[]> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/import-export";
        initNodeSampleProject(projectRoot);
        result = await processProject(projectRoot);

        if(!result.get(LCEVariableDeclaration.conceptId)) {
            throw new Error("Could not find variable declarations in result data.")
        }
        for(const concept of (result.get(LCEVariableDeclaration.conceptId) ?? [])) {
            const varDecl: LCEVariableDeclaration = concept as LCEVariableDeclaration;
            if(!varDecl.fqn) {
                throw new Error("Variable declaration has no fqn " + JSON.stringify(varDecl));
            }
            if(varDecls.has(varDecl.fqn)) {
                throw new Error("Two variable declarations with same FQN were returned: " + varDecl.fqn);
            }
            varDecls.set(varDecl.fqn, varDecl);
        }

        if(!result.get(LCEExportDeclaration.conceptId)) {
            throw new Error("Could not find export declarations in result data.")
        }
        for(const concept of (result.get(LCEExportDeclaration.conceptId) ?? [])) {
            const exportDecl: LCEExportDeclaration = concept as LCEExportDeclaration;
            if(!exportDecl.sourceFilePath) {
                throw new Error("Variable declaration has no source file path " + JSON.stringify(exportDecl));
            }
            if(!exportDecls.has(exportDecl.sourceFilePath)) {
                exportDecls.set(exportDecl.sourceFilePath, []);
            }
            exportDecls.get(exportDecl.sourceFilePath)?.push(exportDecl);
        }

        dependencies = getDependenciesFromResult(result);
    });

    test("direct declaration exports (source1.ts)", async () => {
        const exports = exportDecls.get('./src/source1.ts');
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(4);
        expectExport(exports!, '"./src/source1.ts".CustomClass', "CustomClass");
        expectExport(exports!, '"./src/source1.ts".CustomInterface', "CustomInterface");
        expectExport(exports!, '"./src/source1.ts".CustomType', "CustomType");
        expectExport(exports!, '"./src/source1.ts".CustomEnum', "CustomEnum");
    });

    test("exports (source2.ts)", async () => {
        const exports = exportDecls.get('./src/source2.ts');
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExport(exports!, '"./src/source2.ts".CustomClass2', "CustomClass2");
        expectExport(exports!, '"./src/source2.ts".CustomInterface2', "CustomInterface2");
        expectExport(exports!, '"./src/source2.ts".CustomType2', "CustomType2", "CustomType2Alias");
        expectExport(exports!, '"./src/source2.ts".CustomEnum2', "CustomEnum2");
        expectExport(exports!, '"./src/source2.ts".DefaultClass2', "DefaultClass2", undefined, true);
    });

    test("exports (source3.ts)", async () => {
        const exports = exportDecls.get('./src/source3.ts');
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExport(exports!, '"./src/source3.ts".CustomClass3', "CustomClass3", "CustomClass3Alias");
        expectExport(exports!, '"./src/source3.ts".CustomInterface3', "CustomInterface3");
        expectExport(exports!, '"./src/source3.ts".CustomType3', "CustomType3");
        expectExport(exports!, '"./src/source3.ts".CustomEnum3', "CustomEnum3");
        expectExport(exports!, '"./src/source3.ts".DefaultClass3', "DefaultClass3", undefined, true);
    });

    test("re-exports (reexport.ts)", async () => {
        const exports = exportDecls.get('./src/reexport.ts');
        expect(exports).toBeDefined();
        expectExport(exports!, '"./src/source1.ts".CustomClass', "CustomClass");
        expectExport(exports!, '"./src/source1.ts".CustomInterface', "CustomInterface");
        expectExport(exports!, '"./src/source1.ts".CustomType', "CustomType");
        expectExport(exports!, '"./src/source1.ts".CustomEnum', "CustomEnum");
        expectDependency(dependencies, './src/reexport.ts', './src/source1.ts', 1);

        expectExport(exports!, '"./src/source2.ts".CustomClass2', "CustomClass2");
        expectDependency(dependencies, './src/reexport.ts', '"./src/source2.ts".CustomClass2', 1);
        expectExport(exports!, '"./src/source2.ts".CustomInterface2', "CustomInterface2", "CustomInterface2Alias");
        expectDependency(dependencies, './src/reexport.ts', '"./src/source2.ts".CustomInterface2', 1);
        expectExport(exports!, '"./src/source2.ts".CustomType2', "CustomType2Alias", "CustomType2AliasAlias");
        expectDependency(dependencies, './src/reexport.ts', '"./src/source2.ts".CustomType2', 1);
        expectExport(exports!, '"./src/source2.ts".DefaultClass2', "default", "DefaultAlias2");
        expectDependency(dependencies, './src/reexport.ts', '"./src/source2.ts".DefaultClass2', 1);

        expectExport(exports!, '"./src/source3.ts".CustomClass3', "CustomClass3Alias", "someNamespace.CustomClass3Alias");
        expectExport(exports!, '"./src/source3.ts".CustomInterface3', "CustomInterface3", "someNamespace.CustomInterface3");
        expectExport(exports!, '"./src/source3.ts".CustomType3', "CustomType3", "someNamespace.CustomType3");
        expectExport(exports!, '"./src/source3.ts".CustomEnum3', "CustomEnum3", "someNamespace.CustomEnum3");
        expectExport(exports!, '"./src/source3.ts".DefaultClass3', "default", "someNamespace.default", true);
        expectDependency(dependencies, './src/reexport.ts', './src/source3.ts', 1);

        expectExport(exports!, '"../external-dummy-project/src/source1.ts".DummyCustomInterface', "DummyCustomInterface");
        expectDependency(dependencies, './src/reexport.ts', '"../external-dummy-project/src/source1.ts".DummyCustomInterface', 1);
        expectExport(exports!, '"../external-dummy-project/src/source3.ts".DummyCustomClass3', "DummyCustomClass3");
        expectExport(exports!, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3', "DummyCustomInterface3");
        expectExport(exports!, '"../external-dummy-project/src/source3.ts".DummyDefaultClass3', "DummyDefaultClass3");
        expectDependency(dependencies, './src/reexport.ts', '../external-dummy-project/src/source3.ts', 1);

        expectExport(exports!, '"./src/reexport.ts".SomeOtherClass', "SomeOtherClass");
        expect(exports!).toHaveLength(18);
    });

    test("imports (imports1.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v1')?.type, '"./src/source3.ts".CustomInterface3');
        expectDependency(dependencies, '"./src/imports1.ts".v1', '"./src/source3.ts".CustomInterface3', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v2')?.type, '"./src/source2.ts".CustomClass2');
        expectDependency(dependencies, '"./src/imports1.ts".v2', '"./src/source2.ts".CustomClass2', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v3')?.type, '"./src/source3.ts".CustomClass3');
        expectDependency(dependencies, '"./src/imports1.ts".v3', '"./src/source3.ts".CustomClass3', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v4')?.type, '"./src/source2.ts".CustomType2');
        expectDependency(dependencies, '"./src/imports1.ts".v4', '"./src/source2.ts".CustomType2', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v5')?.type, '"../external-dummy-project/src/source1.ts".DummyCustomInterface');
        expectDependency(dependencies, '"./src/imports1.ts".v5', '"../external-dummy-project/src/source1.ts".DummyCustomInterface', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v6')?.type, '"../external-dummy-project/src/source1.ts".DummyCustomClass');
        expectDependency(dependencies, '"./src/imports1.ts".v6', '"../external-dummy-project/src/source1.ts".DummyCustomClass', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v7')?.type, '"../external-dummy-project/src/source2.ts".DummyCustomType2');
        expectDependency(dependencies, '"./src/imports1.ts".v7', '"../external-dummy-project/src/source2.ts".DummyCustomType2', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v8')?.type, '"../external-dummy-project/src/source3.ts".DummyCustomClass3');
        expectDependency(dependencies, '"./src/imports1.ts".v8', '"../external-dummy-project/src/source3.ts".DummyCustomClass3', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v9')?.type, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3');
        expectDependency(dependencies, '"./src/imports1.ts".v9', '"../external-dummy-project/src/source3.ts".DummyCustomInterface3', 1);

        expectDeclaredType(varDecls.get('"./src/imports1.ts".d1')?.type, '"./src/source2.ts".DefaultClass2');
        expectDependency(dependencies, '"./src/imports1.ts".d1', '"./src/source2.ts".DefaultClass2', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d2')?.type, '"./src/source3.ts".DefaultClass3');
        expectDependency(dependencies, '"./src/imports1.ts".d2', '"./src/source3.ts".DefaultClass3', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d3')?.type, '"./src/source3.ts".DefaultClass3');
        expectDependency(dependencies, '"./src/imports1.ts".d3', '"./src/source3.ts".DefaultClass3', 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d4')?.type, '"../external-dummy-project/src/source3.ts".DummyDefaultClass3');
        expectDependency(dependencies, '"./src/imports1.ts".d4', '"../external-dummy-project/src/source3.ts".DummyDefaultClass3', 1);

        // ensure that no module wide dependencies are present
        expect(dependencies.get('./src/imports1.ts')).toBeUndefined();
    });

    test("Node.js re-exports (reexport-node.ts)", async () => {
        const exports = exportDecls.get('./src/reexport-node.ts');
        expect(exports).toBeDefined();
        expectExport(exports!, '"cowsay".IOptions', "IOptions");
        expectDependency(dependencies, './src/reexport-node.ts', 'cowsay', 1);
        expectExport(exports!, '"progress".ProgressBar.ProgressBarOptions', "ProgressBar.ProgressBarOptions", "PBO");
        expectDependency(dependencies, './src/reexport-node.ts', '"progress".ProgressBar.ProgressBarOptions', 1);
        expect(exports!).toHaveLength(2);
    });

    test("imports (imports2.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/imports2.ts".v1')?.type, '"progress".ProgressBar.ProgressBarOptions');
        expectDependency(dependencies, '"./src/imports2.ts".v1', '"progress".ProgressBar.ProgressBarOptions', 1);
        expectDeclaredType(varDecls.get('"./src/imports2.ts".v2')?.type, '"cowsay".IOptions');
        expectDependency(dependencies, '"./src/imports2.ts".v2', '"cowsay".IOptions', 1);

        // ensure that no module wide dependencies are present
        expect(dependencies.get('./src/imports2.ts')).toBeUndefined();
    });

});
