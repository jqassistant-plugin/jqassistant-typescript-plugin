import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredValue,
    expectLiteralValue,
    expectObjectType,
    expectObjectTypeMember,
    expectObjectValue,
    getDependenciesFromResult,
} from "../../utils/test-utils";
import { LCEClassDeclaration } from "../../../src/core/concepts/class-declaration.concept";
import { LCEValueCall } from "../../../src/core/concepts/value.concept";

jest.setTimeout(30000);

describe("decorators test (legacy)", () => {
    let result: Map<string, LCEConcept[]>;
    const classDecls: Map<string, LCEClassDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/decorators-legacy";
        result = await processProject(projectRoot);

        if (!result.get(LCEClassDeclaration.conceptId)) {
            throw new Error("Could not find class declarations in result data.");
        }

        for (const concept of result.get(LCEClassDeclaration.conceptId) ?? []) {
            const classDecl: LCEClassDeclaration = concept as LCEClassDeclaration;
            if (!classDecl.fqn) {
                throw new Error("Class declaration has no fqn " + JSON.stringify(classDecl));
            }
            if (classDecls.has(classDecl.fqn)) {
                throw new Error("Two class declarations with same FQN were returned: " + classDecl.fqn);
            }
            classDecls.set(classDecl.fqn, classDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("class marker decorator", async () => {
        const decl = classDecls.get('"./src/main.ts".cMarker');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cMarker");
            expect(decl.abstract).toBe(false);
            expect(decl.typeParameters).toHaveLength(0);
            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);
            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(1);
            expectDeclaredValue(decl.decorators[0].value, '"./src/main.ts".dClassMarker');
        }
    });

    test("class decorator with arguments", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassArg');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cClassArg");
            expect(decl.abstract).toBe(false);
            expect(decl.typeParameters).toHaveLength(0);
            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);
            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(1);
            const value = decl.decorators[0].value;
            expect(value).toBeDefined();
            expect(value.valueType).toBe("call");
            expect((value as LCEValueCall).typeArgs).toHaveLength(0);
            expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dClassArgs');
            const args = (value as LCEValueCall).args;
            expect(args).toHaveLength(2);
            expectLiteralValue(args[0], 5, "number");
            expectLiteralValue(args[1], "abc", "string");
        }
    });

    test("class decorator with object argument", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassObjectArg');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cClassObjectArg");
            expect(decl.abstract).toBe(false);
            expect(decl.typeParameters).toHaveLength(0);
            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);
            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(1);
            const value = decl.decorators[0].value;
            expect(value).toBeDefined();
            expect(value.valueType).toBe("call");
            expect((value as LCEValueCall).typeArgs).toHaveLength(0);
            expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dClassObjectArg');
            const args = (value as LCEValueCall).args;
            expect(args).toHaveLength(1);
            const oValue = expectObjectValue(args[0], 2);
            const oType = expectObjectType(oValue.type, 2);
            expectObjectTypeMember(oType, "mem1", false, false, "number");
            expectObjectTypeMember(oType, "mem2", false, false, "string");
            expectLiteralValue(oValue.members.get("mem1"), 1, "number");
            expectLiteralValue(oValue.members.get("mem2"), "xyz", "string");
        }
    });

    test("multiple class decorators", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassMulti');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cClassMulti");
            expect(decl.abstract).toBe(false);
            expect(decl.typeParameters).toHaveLength(0);
            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);
            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(2);
        }
    });

});
