import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredValue,
    expectDependency,
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
        expect(decl!.decorators).toHaveLength(1);
        expectDeclaredValue(decl!.decorators[0].value, '"./src/main.ts".dClassMarker');
    });

    test("class decorator with arguments", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassArg');
        expect(decl).toBeDefined();
        expect(decl!.decorators).toHaveLength(1);
        const value = decl!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dClassArgs');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(2);
        expectLiteralValue(args[0], 5, "number");
        expectLiteralValue(args[1], "abc", "string");

    });

    test("class decorator with object argument", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassObjectArg');
        expect(decl).toBeDefined();
        expect(decl!.decorators).toHaveLength(1);
        const value = decl!.decorators[0].value;
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
    });

    test("multiple class decorators", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassMulti');
        expect(decl).toBeDefined();
        expect(decl!.decorators).toHaveLength(2);
    });

    test("class decorator with arguments from another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cClassArgExt');
        expect(decl).toBeDefined();
        expect(decl!.decorators).toHaveLength(1);
        const value = decl!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/secondary.ts".dClassArgsExternal');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(2);
        expectLiteralValue(args[0], 3, "number");
        expectLiteralValue(args[1], "wow", "string");

        expectDependency(dependencies, '"./src/main.ts".cClassArgExt', '"./src/secondary.ts".dClassArgsExternal', 1);
    });

    test("method marker decorator", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cMethodDecorators');
        expect(classDecl).toBeDefined();
        const method = classDecl!.methods.find(m => m.methodName === "method1");
        expect(method).toBeDefined();
        expect(method!.decorators).toHaveLength(1);
        expectDeclaredValue(method!.decorators[0].value, '"./src/main.ts".dMethodMarker');
    });

    test("method decorator with arguments", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cMethodDecorators');
        expect(classDecl).toBeDefined();
        const method = classDecl!.methods.find(m => m.methodName === "method2");
        expect(method).toBeDefined();
        expect(method!.decorators).toHaveLength(1);
        const value = method!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dMethodArgs');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(2);
        expectLiteralValue(args[0], 42, "number");
        expectLiteralValue(args[1], "hello", "string");
    });

    test("method decorator with object argument", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cMethodDecorators');
        expect(classDecl).toBeDefined();
        const method = classDecl!.methods.find(m => m.methodName === "method3");
        expect(method).toBeDefined();
        expect(method!.decorators).toHaveLength(1);
        const value = method!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dMethodObjectArg');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(1);
        const oValue = expectObjectValue(args[0], 2);
        const oType = expectObjectType(oValue.type, 2);
        expectObjectTypeMember(oType, "mem1", false, false, "number");
        expectObjectTypeMember(oType, "mem2", false, false, "string");
        expectLiteralValue(oValue.members.get("mem1"), 100, "number");
        expectLiteralValue(oValue.members.get("mem2"), "world", "string");
    });

    test("property marker decorator", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cPropertyDecorators');
        expect(classDecl).toBeDefined();
        const property = classDecl!.properties.find(p => p.propertyName === "property1");
        expect(property).toBeDefined();
        expect(property!.decorators).toHaveLength(1);
        expectDeclaredValue(property!.decorators[0].value, '"./src/main.ts".dPropertyMarker');
    });

    test("property decorator with arguments", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cPropertyDecorators');
        expect(classDecl).toBeDefined();
        const property = classDecl!.properties.find(p => p.propertyName === "property2");
        expect(property).toBeDefined();
        expect(property!.decorators).toHaveLength(1);
        const value = property!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dPropertyArgs');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(2);
        expectLiteralValue(args[0], 5, "number");
        expectLiteralValue(args[1], "abc", "string");
    });

    test("property decorator with object argument", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cPropertyDecorators');
        expect(classDecl).toBeDefined();
        const property = classDecl!.properties.find(p => p.propertyName === "property3");
        expect(property).toBeDefined();
        expect(property!.decorators).toHaveLength(1);
        const value = property!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dPropertyObjectArg');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(1);
        const oValue = expectObjectValue(args[0], 2);
        const oType = expectObjectType(oValue.type, 2);
        expectObjectTypeMember(oType, "mem1", false, false, "number");
        expectObjectTypeMember(oType, "mem2", false, false, "string");
        expectLiteralValue(oValue.members.get("mem1"), 1, "number");
        expectLiteralValue(oValue.members.get("mem2"), "xyz", "string");
    });

    test("parameter marker decorator", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cParameterDecorators');
        expect(classDecl).toBeDefined();
        const method = classDecl!.methods[0];
        expect(method).toBeDefined();
        const parameter = method.parameters[0];
        expect(parameter).toBeDefined();
        expect(parameter!.decorators).toHaveLength(1);
        expectDeclaredValue(parameter!.decorators[0].value, '"./src/main.ts".dParameterMarker');
    });

    test("parameter decorator with arguments", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cParameterDecorators');
        expect(classDecl).toBeDefined();
        const method = classDecl!.methods[0];
        expect(method).toBeDefined();
        const parameter = method.parameters[1];
        expect(parameter).toBeDefined();
        expect(parameter!.decorators).toHaveLength(1);
        const value = parameter!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dParameterArgs');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(2);
        expectLiteralValue(args[0], 10, "number");
        expectLiteralValue(args[1], "param2", "string");
    });

    test("parameter decorator with object argument", async () => {
        const classDecl = classDecls.get('"./src/main.ts".cParameterDecorators');
        expect(classDecl).toBeDefined();
        const method = classDecl!.methods[0];
        expect(method).toBeDefined();
        const parameter = method.parameters[2];
        expect(parameter).toBeDefined();
        expect(parameter!.decorators).toHaveLength(1);
        const value = parameter!.decorators[0].value;
        expect(value).toBeDefined();
        expect(value.valueType).toBe("call");
        expect((value as LCEValueCall).typeArgs).toHaveLength(0);
        expectDeclaredValue((value as LCEValueCall).callee, '"./src/main.ts".dParameterObjectArg');
        const args = (value as LCEValueCall).args;
        expect(args).toHaveLength(1);
        const oValue = expectObjectValue(args[0], 2);
        const oType = expectObjectType(oValue.type, 2);
        expectObjectTypeMember(oType, "mem1", false, false, "number");
        expectObjectTypeMember(oType, "mem2", false, false, "string");
        expectLiteralValue(oValue.members.get("mem1"), 20, "number");
        expectLiteralValue(oValue.members.get("mem2"), "param3", "string");
    });

});
