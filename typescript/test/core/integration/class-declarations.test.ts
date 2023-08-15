import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectLiteralType,
    expectMethod,
    expectOptionalPrimitiveType,
    expectProperty,
    expectTypeParameterDeclaration,
    expectTypeParameterReference,
    getDependenciesFromResult,
} from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEClassDeclaration } from "../../../src/core/concepts/class-declaration.concept";

jest.setTimeout(30000);

describe("class declarations test", () => {
    let result: Map<string, LCEConcept[]>;
    const classDecls: Map<string, LCEClassDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/class-declarations";
        result = await processProject(projectRoot);

        if (!result.get(LCEClassDeclaration.conceptId)) {
            throw new Error("Could not find function declarations in result data.");
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

    test("empty class", async () => {
        const decl = classDecls.get('"./src/main.ts".cEmpty');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cEmpty");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("exported empty class", async () => {
        const decl = classDecls.get('"./src/main.ts".cExported');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cExported");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).declFqn === '"./src/main.ts".cExported');

            expect(exportDeclConcept).not.toBeNull();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("value");
                expect(exportDecl.identifier).toBe("cExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePath).toBe(mainModule.fqn);
            }
        }
    });

    test("class with properties", async () => {
        const decl = classDecls.get('"./src/main.ts".cProperties');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cProperties");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(6);
            expectProperty(decl.properties, '"./src/main.ts".cProperties.x', "x", false, "private", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cProperties.y', "y", false, "protected", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cProperties.z', "z", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cProperties.w', "w", false, "js_private", false, false, false, false, "number");
            const propA = expectProperty(decl.properties, '"./src/main.ts".cProperties.a', "a", false, "public", true, false, false, false);
            expectLiteralType(propA.type, 5);
            const propB = expectProperty(decl.properties, '"./src/main.ts".cProperties.b', "b", true, "public", false, false, false, false);
            expectOptionalPrimitiveType(propB.type, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with constructor", async () => {
        const decl = classDecls.get('"./src/main.ts".cConstructor');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cConstructor");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).not.toBeNull();
            if(decl.constr) {
                expect(decl.constr.fqn).toBe('"./src/main.ts".cConstructor.constructor');
                expect(decl.constr.parameters).toHaveLength(2);
                expectFunctionParameter(decl.constr.parameters, 0, "x", false, "number");
                expectFunctionParameter(decl.constr.parameters, 1, "y", false, "number");
                expect(decl.constr.parameterProperties).toHaveLength(0);
            }
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cConstructor.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cConstructor.y', "y", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with methods", async () => {
        const decl = classDecls.get('"./src/main.ts".cMethods');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cMethods");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(5);
            const methodX = expectMethod(decl.methods, '"./src/main.ts".cMethods.x', "x", "private", false, false, false, "void");
            expect(methodX.parameters).toHaveLength(0);
            expect(methodX.typeParameters).toHaveLength(0);
            const methodY = expectMethod(decl.methods, '"./src/main.ts".cMethods.y', "y", "protected", false, false, false, "void");
            expect(methodY.parameters).toHaveLength(0);
            expect(methodY.typeParameters).toHaveLength(0);
            const methodZ = expectMethod(decl.methods, '"./src/main.ts".cMethods.z', "z", "public", false, false, false, "void");
            expect(methodZ.parameters).toHaveLength(0);
            expect(methodZ.typeParameters).toHaveLength(0);
            const methodW = expectMethod(decl.methods, '"./src/main.ts".cMethods.w', "w", "js_private", false, false, false, "void");
            expect(methodW.parameters).toHaveLength(0);
            expect(methodW.typeParameters).toHaveLength(0);
            const methodA = expectMethod(decl.methods, '"./src/main.ts".cMethods.a', "a", "public", false, false, false, "string");
            expect(methodA.parameters).toHaveLength(2);
            expectFunctionParameter(methodA.parameters, 0, "p1", false, "number");
            expectFunctionParameter(methodA.parameters, 1, "p2", false, "string");
            expect(methodA.typeParameters).toHaveLength(0);

            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test.skip("class with getters and setters", async () => {
        // TODO: general improvements to getters and setters needed (maybe additional referenced property node?)
    });

    test("class with parameter properties", async () => {
        const decl = classDecls.get('"./src/main.ts".cParameterProperties');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cParameterProperties");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).not.toBeNull();
            if(decl.constr) {
                expect(decl.constr.fqn).toBe('"./src/main.ts".cParameterProperties.constructor');
                expect(decl.constr.parameters).toHaveLength(3);
                expectFunctionParameter(decl.constr.parameters, 0, "x", false, "number");
                expectFunctionParameter(decl.constr.parameters, 1, "other", false, "string");
                expectFunctionParameter(decl.constr.parameters, 2, "y", false, "number");
                expect(decl.constr.parameterProperties).toHaveLength(2);
                expectProperty(decl.constr.parameterProperties, '"./src/main.ts".cParameterProperties.x', "x", false, "public", false, false, false, false, "number");
                expect(decl.constr.parameterProperties[0]!.index).toBe(0);
                expectProperty(decl.constr.parameterProperties, '"./src/main.ts".cParameterProperties.y', "y", false, "public", false, false, false, false, "number");
                expect(decl.constr.parameterProperties[1]!.index).toBe(2);
            }

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with static members", async () => {
        const decl = classDecls.get('"./src/main.ts".cStatic');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cStatic");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".cStatic.staticA', "staticA", false, "public", false, false, false, true, "number");

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".cStatic.staticSum', "staticSum", "public", false, false, true, "number");
            expect(method.parameters).toHaveLength(2);
            expectFunctionParameter(method.parameters, 0, "x", false, "number");
            expectFunctionParameter(method.parameters, 1, "y", false, "number");
            expect(method.typeParameters).toHaveLength(0);

            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("abstract class", async () => {
        const decl = classDecls.get('"./src/main.ts".cAbstract');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cAbstract");
            expect(decl.abstract).toBe(true);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cAbstract.abstractA', "abstractA", false, "public", false, false, true, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cAbstract.nonAbstractA', "nonAbstractA", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(2);
            const abstractMethod = expectMethod(decl.methods, '"./src/main.ts".cAbstract.abstractSum', "abstractSum", "public", false, true, false, "number");
            expect(abstractMethod.parameters).toHaveLength(2);
            expectFunctionParameter(abstractMethod.parameters, 0, "x", false, "number");
            expectFunctionParameter(abstractMethod.parameters, 1, "y", false, "number");
            expect(abstractMethod.typeParameters).toHaveLength(0);
            const nonAbstractMethod = expectMethod(decl.methods, '"./src/main.ts".cAbstract.nonAbstractSum', "nonAbstractSum", "public", false, false, false, "number");
            expect(nonAbstractMethod.parameters).toHaveLength(2);
            expectFunctionParameter(nonAbstractMethod.parameters, 0, "x", false, "number");
            expectFunctionParameter(nonAbstractMethod.parameters, 1, "y", false, "number");
            expect(nonAbstractMethod.typeParameters).toHaveLength(0);

            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class extending another class", async () => {
        const decl = classDecls.get('"./src/main.ts".cExtends');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cExtends");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.extendsClass, '"./src/main.ts".CustomClass');
            expectDependency(dependencies,'"./src/main.ts".cExtends', '"./src/main.ts".CustomClass', 1);
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".cExtends.x', "x", false, "public", false, true, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class implementing an interface", async () => {
        const decl = classDecls.get('"./src/main.ts".cImplements');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cImplements");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.implementsInterfaces[0], '"./src/main.ts".CustomInterface');
            expectDependency(dependencies,'"./src/main.ts".cImplements', '"./src/main.ts".CustomInterface', 1);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cImplements.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplements.y', "y", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class implementing multiple interfaces", async () => {
        const decl = classDecls.get('"./src/main.ts".cImplementsMulti');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cImplementsMulti");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(2);
            expectDeclaredType(decl.implementsInterfaces[0], '"./src/main.ts".CustomInterface');
            expectDependency(dependencies,'"./src/main.ts".cImplementsMulti', '"./src/main.ts".CustomInterface', 1);
            expectDeclaredType(decl.implementsInterfaces[1], '"./src/main.ts".CustomInterface2');
            expectDependency(dependencies,'"./src/main.ts".cImplementsMulti', '"./src/main.ts".CustomInterface2', 1);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(3);
            expectProperty(decl.properties, '"./src/main.ts".cImplements.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplements.y', "y", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplements.str', "str", false, "public", false, false, false, false, "string");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with dependencies", async () => {
        const decl = classDecls.get('"./src/main.ts".cRef');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cRef");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".cRef.x', "x", false, "public", false, false, false, false);
            expectDeclaredType(prop.type, '"./src/main.ts".CustomInterface');
            expectDependency(dependencies, '"./src/main.ts".cRef.x', '"./src/main.ts".CustomInterface', 1);

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".cRef.method', "method", "public", false, false, false);
            expectDeclaredType(method.returnType, '"./src/main.ts".CustomClass');
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(dependencies, '"./src/main.ts".cRef.method', '"./src/main.ts".CustomClass', 2);

            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class extending a class of another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cExtendsExt');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cExtendsExt");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.extendsClass, '"./src/secondary.ts".ExternalCustomClass');
            expectDependency(dependencies,'"./src/main.ts".cExtendsExt', '"./src/secondary.ts".ExternalCustomClass', 1);
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".cExtendsExt.x', "x", false, "public", false, true, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class implementing an interface of another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cImplementsExt');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cImplementsExt");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.implementsInterfaces[0], '"./src/secondary.ts".ExternalCustomInterface');
            expectDependency(dependencies,'"./src/main.ts".cImplementsExt', '"./src/secondary.ts".ExternalCustomInterface', 1);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cImplementsExt.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplementsExt.y', "y", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with dependencies to another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cRefExt');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cRefExt");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".cRefExt.x', "x", false, "public", false, false, false, false);
            expectDeclaredType(prop.type, '"./src/secondary.ts".ExternalCustomInterface');
            expectDependency(dependencies, '"./src/main.ts".cRefExt.x', '"./src/secondary.ts".ExternalCustomInterface', 1);

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".cRefExt.method', "method", "public", false, false, false);
            expectDeclaredType(method.returnType, '"./src/secondary.ts".ExternalCustomClass');
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(dependencies, '"./src/main.ts".cRefExt.method', '"./src/secondary.ts".ExternalCustomClass', 2);

            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with type parameters", async () => {
        const decl = classDecls.get('"./src/main.ts".cGeneric');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.className).toBe("cGeneric");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T");

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(2);
            const method = expectMethod(decl.methods, '"./src/main.ts".cGeneric.method', "method", "public", false, false, false);
            expectTypeParameterReference(method.returnType, "T");
            expect(method.parameters).toHaveLength(1);
            expectFunctionParameter(method.parameters, 0, "p1", false);
            expectTypeParameterReference(method.parameters[0]!.type, "T");
            expect(method.typeParameters).toHaveLength(0);

            const methodNested = expectMethod(decl.methods, '"./src/main.ts".cGeneric.methodNested', "methodNested", "public", false, false, false);
            expectTypeParameterReference(methodNested.returnType, "U");
            expect(methodNested.parameters).toHaveLength(2);
            expectFunctionParameter(methodNested.parameters, 0, "p1", false);
            expectTypeParameterReference(methodNested.parameters[0]!.type, "T");
            expectFunctionParameter(methodNested.parameters, 1, "p2", false);
            expectTypeParameterReference(methodNested.parameters[1]!.type, "U");

            expect(methodNested.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(methodNested.typeParameters, 0,"U");

            expect(decl.getters).toHaveLength(0);
            expect(decl.setters).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });
});
