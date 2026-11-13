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
import { LCEClassDeclaration } from "../../../src/core/concepts/class-declaration.concept";
import { LCEFunctionDeclaration } from "../../../src/core/concepts/function-declaration.concept";
import { LCEInterfaceDeclaration } from "../../../src/core/concepts/interface-declaration.concept";
import { LCENamedConcept } from "../../../src/core/concept";
import { IndexEnum, IndexVar } from "./sample-projects/import-export/src/subdir";

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
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }
        result = projects[0].concepts;

        if (!result.get(LCEVariableDeclaration.conceptId)) {
            throw new Error("Could not find variable declarations in result data.");
        }
        for (const concept of result.get(LCEVariableDeclaration.conceptId) ?? []) {
            const varDecl: LCEVariableDeclaration = concept as LCEVariableDeclaration;
            if (!varDecl.fqn.localFqn) {
                throw new Error("Variable declaration has no local FQN " + JSON.stringify(varDecl));
            }
            if (varDecls.has(varDecl.fqn.localFqn)) {
                throw new Error("Two variable declarations with same FQN were returned: " + varDecl.fqn.localFqn);
            }
            varDecls.set(varDecl.fqn.localFqn, varDecl);
        }

        if (!result.get(LCEExportDeclaration.conceptId)) {
            throw new Error("Could not find export declarations in result data.");
        }
        for (const concept of result.get(LCEExportDeclaration.conceptId) ?? []) {
            const exportDecl: LCEExportDeclaration = concept as LCEExportDeclaration;
            if (!exportDecl.sourceFilePathAbsolute) {
                throw new Error("Variable declaration has no source file path " + JSON.stringify(exportDecl));
            }
            if (!exportDecls.has(exportDecl.sourceFilePathAbsolute)) {
                exportDecls.set(exportDecl.sourceFilePathAbsolute, []);
            }
            exportDecls.get(exportDecl.sourceFilePathAbsolute)?.push(exportDecl);
        }

        dependencies = getDependenciesFromResult(result);
    });

    test("direct declaration exports (source1.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/source1.ts"));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(4);
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomClass', "CustomClass");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomInterface', "CustomInterface");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomType', "CustomType");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomEnum', "CustomEnum");
    });

    test("exports (source2.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/source2.ts"));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomClass2', "CustomClass2");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomInterface2', "CustomInterface2");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomType2', "CustomType2", "CustomType2Alias");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomEnum2', "CustomEnum2");
        expectExport(projectRootPath, exports!, '"./src/source2.ts".default', "DefaultClass2", undefined, true);
    });

    test("exports (source3.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/source3.ts"));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(5);
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomClass3', "CustomClass3", "CustomClass3Alias");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomInterface3', "CustomInterface3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomType3', "CustomType3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomEnum3', "CustomEnum3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".default', "DefaultClass3", undefined, true);
    });

    test("re-exports (reexport.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/reexport.ts"));
        expect(exports).toBeDefined();
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomClass', "CustomClass");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomInterface', "CustomInterface");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomType', "CustomType");
        expectExport(projectRootPath, exports!, '"./src/source1.ts".CustomEnum', "CustomEnum");
        expectDependency(projectRootPath, dependencies, "./src/reexport.ts", resolveGlobalFqn(projectRootPath, "./src/source1.ts"), 1);

        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomClass2', "CustomClass2");
        expectDependency(projectRootPath, dependencies, "./src/reexport.ts", resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomClass2'), 1);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomInterface2', "CustomInterface2", "CustomInterface2Alias");
        expectDependency(
            projectRootPath,
            dependencies,
            "./src/reexport.ts",
            resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomInterface2'),
            1,
        );
        expectExport(projectRootPath, exports!, '"./src/source2.ts".CustomType2', "CustomType2Alias", "CustomType2AliasAlias");
        expectDependency(projectRootPath, dependencies, "./src/reexport.ts", resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomType2'), 1);
        expectExport(projectRootPath, exports!, '"./src/source2.ts".default', "default", "DefaultAlias2");
        expectDependency(projectRootPath, dependencies, "./src/reexport.ts", resolveGlobalFqn(projectRootPath, '"./src/source2.ts".default'), 1);

        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomClass3', "CustomClass3Alias", "someNamespace.CustomClass3Alias");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomInterface3', "CustomInterface3", "someNamespace.CustomInterface3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomType3', "CustomType3", "someNamespace.CustomType3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".CustomEnum3', "CustomEnum3", "someNamespace.CustomEnum3");
        expectExport(projectRootPath, exports!, '"./src/source3.ts".default', "default", "someNamespace.default", true);
        expectDependency(projectRootPath, dependencies, "./src/reexport.ts", resolveGlobalFqn(projectRootPath, "./src/source3.ts"), 1);

        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source1.ts".DummyCustomInterface', "DummyCustomInterface");
        expectDependency(
            projectRootPath,
            dependencies,
            "./src/reexport.ts",
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomInterface'),
            1,
        );
        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source3.ts".DummyCustomClass3', "DummyCustomClass3");
        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3', "DummyCustomInterface3");
        expectExport(projectRootPath, exports!, '"../external-dummy-project/src/source3.ts".default', "default");
        expectDependency(
            projectRootPath,
            dependencies,
            "./src/reexport.ts",
            resolveGlobalFqn(projectRootPath, "../external-dummy-project/src/source3.ts"),
            1,
        );

        expectExport(projectRootPath, exports!, '"./src/reexport.ts".SomeOtherClass', "SomeOtherClass");
        expect(exports!).toHaveLength(18);
    });

    test("exports (subdir/index.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/subdir/index.ts"));
        expect(exports).toBeDefined();
        expect(exports!).toHaveLength(7);
        expectExport(projectRootPath, exports!, '"./src/subdir".IndexClass', "IndexClass");
        expectExport(projectRootPath, exports!, '"./src/subdir".IndexInterface', "IndexInterface");
        expectExport(projectRootPath, exports!, '"./src/subdir".IndexType', "IndexType");
        expectExport(projectRootPath, exports!, '"./src/subdir".IndexVar', "IndexVar");
        expectExport(projectRootPath, exports!, '"./src/subdir".IndexFunction', "IndexFunction");
        expectExport(projectRootPath, exports!, '"./src/subdir".IndexEnum', "IndexEnum");
        expectExport(projectRootPath, exports!, '"./src/subdir".AliasClass', "AliasClass", "AliasAliasClass");
    });

    test("imports (imports1.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v1')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomInterface3'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v1',
            resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomInterface3'),
            1,
        );
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v2')?.type, resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomClass2'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v2',
            resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomClass2'),
            1,
        );
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v3')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomClass3'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v3',
            resolveGlobalFqn(projectRootPath, '"./src/source3.ts".CustomClass3'),
            1,
        );
        expectDeclaredType(varDecls.get('"./src/imports1.ts".v4')?.type, resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomType2'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v4',
            resolveGlobalFqn(projectRootPath, '"./src/source2.ts".CustomType2'),
            1,
        );
        expectDeclaredType(
            varDecls.get('"./src/imports1.ts".v5')?.type,
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomInterface'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v5',
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomInterface'),
            1,
        );
        expectDeclaredType(
            varDecls.get('"./src/imports1.ts".v6')?.type,
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomClass'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v6',
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source1.ts".DummyCustomClass'),
            1,
        );
        expectDeclaredType(
            varDecls.get('"./src/imports1.ts".v7')?.type,
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source2.ts".DummyCustomType2'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v7',
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source2.ts".DummyCustomType2'),
            1,
        );
        expectDeclaredType(
            varDecls.get('"./src/imports1.ts".v8')?.type,
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomClass3'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v8',
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomClass3'),
            1,
        );
        expectDeclaredType(
            varDecls.get('"./src/imports1.ts".v9')?.type,
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".v9',
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".DummyCustomInterface3'),
            1,
        );

        expectDeclaredType(varDecls.get('"./src/imports1.ts".d1')?.type, resolveGlobalFqn(projectRootPath, '"./src/source2.ts".default'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d1', resolveGlobalFqn(projectRootPath, '"./src/source2.ts".default'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d2')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".default'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d2', resolveGlobalFqn(projectRootPath, '"./src/source3.ts".default'), 1);
        expectDeclaredType(varDecls.get('"./src/imports1.ts".d3')?.type, resolveGlobalFqn(projectRootPath, '"./src/source3.ts".default'));
        expectDependency(projectRootPath, dependencies, '"./src/imports1.ts".d3', resolveGlobalFqn(projectRootPath, '"./src/source3.ts".default'), 1);
        expectDeclaredType(
            varDecls.get('"./src/imports1.ts".d4')?.type,
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".default'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/imports1.ts".d4',
            resolveGlobalFqn(projectRootPath, '"../external-dummy-project/src/source3.ts".default'),
            1,
        );

        // ensure that no module wide dependencies are present
        expect(dependencies.get("./src/imports1.ts")).toBeUndefined();
    });

    test("Node.js re-exports (reexport-node.ts)", async () => {
        const exports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/reexport-node.ts"));
        expect(exports).toBeDefined();
        expectExport(projectRootPath, exports!, '"cowsay".IOptions', "IOptions");
        expectExport(projectRootPath, exports!, '"cowsay".say', "say");
        expectDependency(projectRootPath, dependencies, "./src/reexport-node.ts", "cowsay", 1);
        expectExport(projectRootPath, exports!, '"progress".ProgressBar.ProgressBarOptions', "ProgressBar.ProgressBarOptions", "PBO");
        expectDependency(projectRootPath, dependencies, "./src/reexport-node.ts", '"progress".ProgressBar.ProgressBarOptions', 1);
        expect(exports!).toHaveLength(3);
    });

    test("imports (imports2.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/imports2.ts".v1')?.type, '"progress".ProgressBar.ProgressBarOptions');
        expectDependency(projectRootPath, dependencies, '"./src/imports2.ts".v1', '"progress".ProgressBar.ProgressBarOptions', 1);
        expectDeclaredType(varDecls.get('"./src/imports2.ts".v2')?.type, '"cowsay".IOptions');
        expectDependency(projectRootPath, dependencies, '"./src/imports2.ts".v2', '"cowsay".IOptions', 1);

        // ensure that no module wide dependencies are present
        expect(dependencies.get("./src/imports2.ts")).toBeUndefined();
    });

    test("imports (importsIndex.ts)", async () => {
        expectDeclaredType(varDecls.get('"./src/importsIndex.ts".a')?.type, resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexClass'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importsIndex.ts".a',
            resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexClass'),
            1,
        );
        expectDeclaredType(varDecls.get('"./src/importsIndex.ts".b')?.type, resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexInterface'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importsIndex.ts".b',
            resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexInterface'),
            1,
        );
        expectDeclaredType(varDecls.get('"./src/importsIndex.ts".c')?.type, resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexType'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importsIndex.ts".c',
            resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexType'),
            1,
        );
        expectDependency(projectRootPath, dependencies, '"./src/importsIndex.ts".d', resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexVar'), 1);
        expectDeclaredType(varDecls.get('"./src/importsIndex.ts".e')?.type, resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexEnum'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importsIndex.ts".e',
            resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexEnum'),
            1,
        );
        expectDeclaredType(varDecls.get('"./src/importsIndex.ts".f')?.type, resolveGlobalFqn(projectRootPath, '"./src/subdir".AliasClass'));
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importsIndex.ts".f',
            resolveGlobalFqn(projectRootPath, '"./src/subdir".AliasClass'),
            1,
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importsIndex.ts".g',
            resolveGlobalFqn(projectRootPath, '"./src/subdir".IndexFunction'),
            1,
        );

        // ensure that no module wide dependencies are present
        expect(dependencies.get("./src/importsIndex.ts")).toBeUndefined();
    });

    test("imports (importPath.ts)", async () => {
        expectDeclaredType(
            varDecls.get('"./src/importPath.ts".v1')?.type,
            resolveGlobalFqn(projectRootPath, '"./src/internal/internal.ts".Internal'),
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/importPath.ts".v1',
            resolveGlobalFqn(projectRootPath, '"./src/internal/internal.ts".Internal'),
            1,
        );

        // ensure that no module wide dependencies are present
        expect(dependencies.get("./src/importPath.ts")).toBeUndefined();
    });

    test("value usages through re-exports (valueUsages.ts)", async () => {
        const expectedDependencies: [string, string, number][] = [
            ['"./src/valueUsages.ts".callFunction', '"./src/values/values.ts".valueFunction', 1],
            ['"./src/valueUsages.ts".callAliasedFunction', '"./src/values/values.ts".valueFunction', 1],
            ['"./src/valueUsages.ts".callNamespaceFunction', '"./src/values/values.ts".valueFunction', 1],
            ['"./src/valueUsages.ts".callDefaultFunction', '"./src/values/defaultFunction.ts".default', 1],
            ['"./src/valueUsages.ts".readConstant', '"./src/values/values.ts".valueConstant', 1],
            // instances: one dependency through the type of the variable, one through the constructor call
            ['"./src/valueUsages.ts".valueInstance', '"./src/values/values.ts".ValueClass', 2],
            ['"./src/valueUsages.ts".aliasedInstance', '"./src/values/values.ts".AliasedValueClass', 2],
            ['"./src/valueUsages.ts".defaultInstance', '"./src/values/values.ts".default', 2],
            ['"./src/valueUsages.ts".defaultIdentifierInstance', '"./src/values/defaultIdentifier.ts".default', 2],
            ['"./src/valueUsages.ts".defaultSpecifierInstance', '"./src/values/defaultSpecifier.ts".default', 2],
            ['"./src/valueUsages.ts".defaultInterfaceValue', '"./src/values/defaultInterface.ts".default', 1],
        ];
        for (const [source, target, cardinality] of expectedDependencies) {
            expectDependency(projectRootPath, dependencies, source, resolveGlobalFqn(projectRootPath, target), cardinality);
            // no further dependencies, e.g. on a re-exporting module
            expect(dependencies.get(resolveGlobalFqn(projectRootPath, source))?.size).toBe(1);
        }

        // re-export from a Node.js package
        expectDependency(projectRootPath, dependencies, '"./src/valueUsages.ts".callNodeFunction', '"cowsay".say', 1);
        expect(dependencies.get(resolveGlobalFqn(projectRootPath, '"./src/valueUsages.ts".callNodeFunction'))?.size).toBe(1);

        expectDeclaredType(
            varDecls.get('"./src/valueUsages.ts".defaultInterfaceValue')?.type,
            resolveGlobalFqn(projectRootPath, '"./src/values/defaultInterface.ts".default'),
        );

        // ensure that no module wide dependencies are present
        expect(dependencies.get(resolveGlobalFqn(projectRootPath, "./src/valueUsages.ts"))).toBeUndefined();
    });

    test("default-exported declarations (values/*.ts)", async () => {
        const findDeclaration = <T extends LCENamedConcept>(conceptId: string, localFqn: string): T | undefined =>
            result.get(conceptId)?.find((c) => (c as T).fqn.globalFqn === resolveGlobalFqn(projectRootPath, localFqn)) as T | undefined;

        expect(findDeclaration<LCEClassDeclaration>(LCEClassDeclaration.conceptId, '"./src/values/values.ts".default')?.className).toBe(
            "DefaultValueClass",
        );
        expect(findDeclaration<LCEClassDeclaration>(LCEClassDeclaration.conceptId, '"./src/values/defaultIdentifier.ts".default')?.className).toBe(
            "DefaultIdentifierClass",
        );
        expect(findDeclaration<LCEClassDeclaration>(LCEClassDeclaration.conceptId, '"./src/values/defaultSpecifier.ts".default')?.className).toBe(
            "DefaultSpecifierClass",
        );
        expect(
            findDeclaration<LCEFunctionDeclaration>(LCEFunctionDeclaration.conceptId, '"./src/values/defaultFunction.ts".default')?.functionName,
        ).toBe("defaultValueFunction");
        expect(
            findDeclaration<LCEInterfaceDeclaration>(LCEInterfaceDeclaration.conceptId, '"./src/values/defaultInterface.ts".default')?.interfaceName,
        ).toBe("DefaultInterface");

        expectExport(
            projectRootPath,
            exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/values/values.ts"))!,
            '"./src/values/values.ts".default',
            "DefaultValueClass",
            undefined,
            true,
        );
        expectExport(
            projectRootPath,
            exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/values/defaultIdentifier.ts"))!,
            '"./src/values/defaultIdentifier.ts".default',
            "default",
            undefined,
            true,
        );
        expectExport(
            projectRootPath,
            exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/values/defaultFunction.ts"))!,
            '"./src/values/defaultFunction.ts".default',
            "defaultValueFunction",
            undefined,
            true,
        );
        expectExport(
            projectRootPath,
            exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/values/defaultInterface.ts"))!,
            '"./src/values/defaultInterface.ts".default',
            "DefaultInterface",
            undefined,
            true,
        );

        // exported by name and as default: both exports point to the same declaration
        const specifierExports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/values/defaultSpecifier.ts"));
        expect(specifierExports).toHaveLength(2);
        for (const exp of specifierExports!) {
            expect(exp.identifier).toBe("DefaultSpecifierClass");
            expect(exp.globalDeclFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/values/defaultSpecifier.ts".default'));
        }
        expect(specifierExports!.map((exp) => exp.isDefault).sort()).toEqual([false, true]);
    });

    test("re-exports of values (values/index.ts, valuesBarrel.ts)", async () => {
        const barrelExports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/values/index.ts"));
        expect(barrelExports).toBeDefined();
        const expectBarrelExport = (exportedName: string, localDeclFqn: string) => {
            const exp = barrelExports!.find((e) => (e.alias ?? e.identifier) === exportedName);
            expect(exp).toBeDefined();
            expect(exp!.globalDeclFqn).toBe(resolveGlobalFqn(projectRootPath, localDeclFqn));
        };
        expectBarrelExport("valueFunction", '"./src/values/values.ts".valueFunction');
        expectBarrelExport("RenamedValueClass", '"./src/values/values.ts".AliasedValueClass');
        expectBarrelExport("DefaultValueClass", '"./src/values/values.ts".default');
        expectBarrelExport("defaultValueFunction", '"./src/values/defaultFunction.ts".default');
        expectBarrelExport("DefaultSpecifierClass", '"./src/values/defaultSpecifier.ts".default');
        expectBarrelExport("DefaultInterface", '"./src/values/defaultInterface.ts".default');
        expectBarrelExport("valuesNamespace.valueFunction", '"./src/values/values.ts".valueFunction');

        const defaultExport = barrelExports!.find(
            (e) => e.isDefault && e.globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/values/defaultIdentifier.ts".default'),
        );
        expect(defaultExport).toBeDefined();

        // "export *" and "export * as" of the same module
        expectDependency(projectRootPath, dependencies, "./src/values/index.ts", resolveGlobalFqn(projectRootPath, "./src/values/values.ts"), 2);
        expectDependency(
            projectRootPath,
            dependencies,
            "./src/values/index.ts",
            resolveGlobalFqn(projectRootPath, '"./src/values/defaultFunction.ts".default'),
            1,
        );

        // re-export of a re-export
        const aliasExports = exportDecls.get(resolveGlobalFqn(projectRootPath, "./src/valuesBarrel.ts"));
        expect(aliasExports).toHaveLength(2);
        expectExport(projectRootPath, aliasExports!, '"./src/values/values.ts".valueFunction', "valueFunction", "aliasedValueFunction");
        expectExport(projectRootPath, aliasExports!, '"./src/values/values.ts".AliasedValueClass', "RenamedValueClass", "DoubleRenamedValueClass");
        expectDependency(
            projectRootPath,
            dependencies,
            "./src/valuesBarrel.ts",
            resolveGlobalFqn(projectRootPath, '"./src/values/values.ts".valueFunction'),
            1,
        );
        expectDependency(
            projectRootPath,
            dependencies,
            "./src/valuesBarrel.ts",
            resolveGlobalFqn(projectRootPath, '"./src/values/values.ts".AliasedValueClass'),
            1,
        );
    });
});
