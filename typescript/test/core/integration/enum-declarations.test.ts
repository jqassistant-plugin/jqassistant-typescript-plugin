import { processProjects } from "../../../src/core/extractor";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { expectEnumMember, expectLiteralValue, expectPrimitiveType, getDependenciesFromResult, resolveGlobalFqn } from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEEnumDeclaration } from "../../../src/core/concepts/enum-declaration.concept";
import { LCEValueComplex, LCEValueDeclared, LCEValueMember } from "../../../src/core/concepts/value.concept";

jest.setTimeout(30000);

describe("enum declarations test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/enum-declarations"
    let result: Map<string, object[]>;
    const enumDecls: Map<string, LCEEnumDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if(projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.")
        }
        result = projects[0].concepts;

        if (!result.get(LCEEnumDeclaration.conceptId)) {
            throw new Error("Could not find enum declarations in result data.");
        }

        for (const concept of result.get(LCEEnumDeclaration.conceptId) ?? []) {
            const enumDecl: LCEEnumDeclaration = concept as LCEEnumDeclaration;
            if (!enumDecl.fqn.localFqn) {
                throw new Error("Enum declaration has no local FQN " + JSON.stringify(enumDecl));
            }
            if (enumDecls.has(enumDecl.fqn.localFqn)) {
                throw new Error("Two enum declarations with same local FQN were returned: " + enumDecl.fqn.localFqn);
            }
            enumDecls.set(enumDecl.fqn.localFqn, enumDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("empty enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eEmpty');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eEmpty'));
            expect(decl.enumName).toBe("eEmpty");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(0);
        }
    });

    test("basic numeric enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eBasic');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eBasic'));
            expect(decl.enumName).toBe("eBasic");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(3);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eBasic.A');
            expect(a.initValue).toBeUndefined();
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eBasic.B');
            expect(b.initValue).toBeUndefined();
            const c = expectEnumMember(decl, "C", '"./src/main.ts".eBasic.C');
            expect(c.initValue).toBeUndefined();
        }
    });

    test("exported basic numeric enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eExported');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eExported'));
            expect(decl.enumName).toBe("eExported");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(3);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eExported.A');
            expect(a.initValue).toBeUndefined();
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eExported.B');
            expect(b.initValue).toBeUndefined();
            const c = expectEnumMember(decl, "C", '"./src/main.ts".eExported.C');
            expect(c.initValue).toBeUndefined();
        }

        const exportDeclConcept = result
            .get(LCEExportDeclaration.conceptId)
            ?.find((exp) => (exp as LCEExportDeclaration).globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/main.ts".eExported'));

        expect(exportDeclConcept).toBeDefined();
        if (exportDeclConcept) {
            const exportDecl = exportDeclConcept as LCEExportDeclaration;
            expect(exportDecl.kind).toBe("value");
            expect(exportDecl.identifier).toBe("eExported");
            expect(exportDecl.alias).toBeUndefined();
            expect(exportDecl.isDefault).toBe(false);
            expect(exportDecl.sourceFilePathAbsolute).toBe(mainModule.fqn.globalFqn);
        }
    });

    test("numeric enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eNumeric');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eNumeric'));
            expect(decl.enumName).toBe("eNumeric");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(3);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eNumeric.A');
            expect(a.initValue).toBeDefined()
            expectLiteralValue(a.initValue, 5, "number");
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eNumeric.B');
            expect(b.initValue).toBeUndefined();
            const c = expectEnumMember(decl, "C", '"./src/main.ts".eNumeric.C');
            expectLiteralValue(c.initValue, 10, "number");
        }
    });

    test("string enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eString');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eString'));
            expect(decl.enumName).toBe("eString");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(2);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eString.A');
            expect(a.initValue).toBeDefined()
            expectLiteralValue(a.initValue, "a", "string");
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eString.B');
            expectLiteralValue(b.initValue, "b", "string");

        }
    });

    test("mixed enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eMixed');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eMixed'));
            expect(decl.enumName).toBe("eMixed");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(2);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eMixed.A');
            expect(a.initValue).toBeDefined()
            expectLiteralValue(a.initValue, 1, "number");
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eMixed.B');
            expectLiteralValue(b.initValue, "b", "string");

        }
    });

    test("enum with pre-calculated constants", async () => {
        const decl = enumDecls.get('"./src/main.ts".eConstants');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eConstants'));
            expect(decl.enumName).toBe("eConstants");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(3);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eConstants.A');
            expect(a.initValue).toBeDefined()
            expect(a.initValue!.valueType).toBeDefined();
            expect(a.initValue!.valueType).toBe("complex");
            expect((a.initValue! as LCEValueComplex).expression).toBe("1 + 1");
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eConstants.B');
            expect(b.initValue).toBeDefined()
            expect(b.initValue!.valueType).toBeDefined();
            expect(b.initValue!.valueType).toBe("complex");
            expect((b.initValue! as LCEValueComplex).expression).toBe('"a" + "b"');
            const c = expectEnumMember(decl, "C", '"./src/main.ts".eConstants.C');
            expect(c.initValue).toBeDefined()
            expect(c.initValue!.valueType).toBeDefined();
            expect(c.initValue!.valueType).toBe("complex");
            expect((c.initValue! as LCEValueComplex).expression).toBe("A + 1");

        }
    });

    test("enum with computed initializer", async () => {
        const decl = enumDecls.get('"./src/main.ts".eComputed');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eComputed'));
            expect(decl.enumName).toBe("eComputed");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(1);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eComputed.A');
            expect(a.initValue).toBeDefined()
            expect(a.initValue!.valueType).toBeDefined();
            expect(a.initValue!.valueType).toBe("member");
            const memberValue = a.initValue! as LCEValueMember;
            expectLiteralValue(memberValue.parent, "abc", "string");
            expect(memberValue.member).toBeDefined();
            expect(memberValue.member.valueType).toBe("declared");
            expect((memberValue.member as LCEValueDeclared).fqn.globalFqn).toBe("length");
            expectPrimitiveType(memberValue.type, "number");
        }
    });

    test("const enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eConst');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eConst'));
            expect(decl.enumName).toBe("eConst");
            expect(decl.constant).toBe(true);
            expect(decl.declared).toBe(false);

            expect(decl.members).toHaveLength(2);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eConst.A');
            expectLiteralValue(a.initValue, 1, "number");
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eConst.B');
            expect(b.initValue).toBeUndefined();
        }
    });

    test("ambient enum", async () => {
        const decl = enumDecls.get('"./src/main.ts".eAmbient');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".eAmbient'));
            expect(decl.enumName).toBe("eAmbient");
            expect(decl.constant).toBe(false);
            expect(decl.declared).toBe(true);

            expect(decl.members).toHaveLength(2);
            const a = expectEnumMember(decl, "A", '"./src/main.ts".eAmbient.A');
            expect(a.initValue).toBeUndefined();
            const b = expectEnumMember(decl, "B", '"./src/main.ts".eAmbient.B');
            expect(b.initValue).toBeUndefined();
        }
    });

});
