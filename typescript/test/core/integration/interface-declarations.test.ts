import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectAccessorProperty,
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectMethod,
    expectOptionalPrimitiveType,
    expectPrimitiveType,
    expectProperty,
    expectTypeParameterDeclaration,
    expectTypeParameterReference,
    getDependenciesFromResult,
} from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEInterfaceDeclaration } from "../../../src/core/concepts/interface-declaration.concept";

jest.setTimeout(30000);

describe("interface declarations test", () => {
    let result: Map<string, LCEConcept[]>;
    const interfaceDecls: Map<string, LCEInterfaceDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/interface-declarations";
        result = await processProject(projectRoot);

        if (!result.get(LCEInterfaceDeclaration.conceptId)) {
            throw new Error("Could not find interface declarations in result data.");
        }

        for (const concept of result.get(LCEInterfaceDeclaration.conceptId) ?? []) {
            const interfaceDecl: LCEInterfaceDeclaration = concept as LCEInterfaceDeclaration;
            if (!interfaceDecl.fqn) {
                throw new Error("Interface declaration has no fqn " + JSON.stringify(interfaceDecl));
            }
            if (interfaceDecls.has(interfaceDecl.fqn)) {
                throw new Error("Two interface declarations with same FQN were returned: " + interfaceDecl.fqn);
            }
            interfaceDecls.set(interfaceDecl.fqn, interfaceDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("empty interface", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iEmpty');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iEmpty");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("exported empty interface", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iExported');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iExported");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).declFqn === '"./src/main.ts".iExported');

            expect(exportDeclConcept).not.toBeNull();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("type");
                expect(exportDecl.identifier).toBe("iExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePath).toBe(mainModule.fqn);
            }
        }
    });

    test("interface with properties", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iProperties');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iProperties");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(3);
            expectProperty(decl.properties, '"./src/main.ts".iProperties.x', "x", false, "public", false, undefined, undefined, undefined, "number");
            expectProperty(decl.properties, '"./src/main.ts".iProperties.a', "a", false, "public", true, undefined, undefined, undefined, "number");
            const propB = expectProperty(decl.properties, '"./src/main.ts".iProperties.b', "b", true, "public", false, undefined, undefined, undefined);
            expectOptionalPrimitiveType(propB.type, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with methods", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iMethods');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iMethods");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(2);
            const methodX = expectMethod(decl.methods, '"./src/main.ts".iMethods.x', "x", "public", undefined, undefined, undefined, "void");
            expect(methodX.parameters).toHaveLength(0);
            expect(methodX.typeParameters).toHaveLength(0);
            const methodA = expectMethod(decl.methods, '"./src/main.ts".iMethods.a', "a", "public", undefined, undefined, undefined, "string");
            expect(methodA.parameters).toHaveLength(2);
            expectFunctionParameter(methodA.parameters, 0, "p1", false, "number");
            expectFunctionParameter(methodA.parameters, 1, "p2", false, "string");
            expect(methodA.typeParameters).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with getters and setters", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iGetterSetter');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iGetterSetter");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(2);
            const accX = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".iGetterSetter.x', "x");
            expect(accX.autoAccessor).toBeUndefined();
            expect(accX.getter).not.toBeNull();
            expectPrimitiveType(accX.getter!.returnType, "number");
            expect(accX.getter!.visibility).toBe("public");
            expect(accX.getter!.decorators).toHaveLength(0);
            expect(accX.getter!.override).toBeUndefined();
            expect(accX.getter!.abstract).toBeUndefined();
            expect(accX.getter!.isStatic).toBeUndefined();
            expect(accX.setter).not.toBeNull();
            expectFunctionParameter(accX.setter!.parameters, 0, "x", false, "number");
            expect(accX.setter!.visibility).toBe("public");
            expect(accX.setter!.decorators).toHaveLength(0);
            expect(accX.setter!.override).toBeUndefined();
            expect(accX.setter!.abstract).toBeUndefined();
            expect(accX.setter!.isStatic).toBeUndefined();

            const accY = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".iGetterSetter.y', "y");
            expect(accY.getter).toBeUndefined();
            expect(accY.autoAccessor).toBeUndefined();
            expect(accY.setter).not.toBeNull();
            expectFunctionParameter(accY.setter!.parameters, 0, "y", false, "number");
            expect(accY.setter!.visibility).toBe("public");
            expect(accY.setter!.decorators).toHaveLength(0);
            expect(accY.setter!.override).toBeUndefined();
            expect(accY.setter!.abstract).toBeUndefined();
            expect(accY.setter!.isStatic).toBeUndefined();
        }
    });

    test("interface extending another interface", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iExtends');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iExtends");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.extendsInterfaces[0], '"./src/main.ts".CustomInterface');
            expectDependency(dependencies,'"./src/main.ts".iExtends', '"./src/main.ts".CustomInterface', 1);

            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".iExtends.newProp', "newProp", false, "public", false, undefined, undefined, undefined, "string");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface extending multiple other interfaces", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iExtendsMulti');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iExtendsMulti");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(2);
            expectDeclaredType(decl.extendsInterfaces[0], '"./src/main.ts".CustomInterface');
            expectDependency(dependencies,'"./src/main.ts".iExtendsMulti', '"./src/main.ts".CustomInterface', 1);
            expectDeclaredType(decl.extendsInterfaces[1], '"./src/main.ts".CustomInterface2');
            expectDependency(dependencies,'"./src/main.ts".iExtendsMulti', '"./src/main.ts".CustomInterface2', 1);

            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".iExtends.newProp', "newProp", false, "public", false, undefined, undefined, undefined, "string");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with dependencies", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iRef');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iRef");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".iRef.x', "x", false, "public", false, undefined, undefined, undefined);
            expectDeclaredType(prop.type, '"./src/main.ts".CustomInterface');
            expectDependency(dependencies, '"./src/main.ts".iRef.x', '"./src/main.ts".CustomInterface', 1);

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".iRef.method', "method", "public", undefined, undefined, undefined);
            expectDeclaredType(method.returnType, '"./src/main.ts".CustomClass');
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(dependencies, '"./src/main.ts".iRef.method', '"./src/main.ts".CustomClass', 1);

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface extending an interface of another module", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iExtendsExt');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iExtendsExt");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.extendsInterfaces[0], '"./src/secondary.ts".ExternalCustomInterface');
            expectDependency(dependencies,'"./src/main.ts".iExtendsExt', '"./src/secondary.ts".ExternalCustomInterface', 1);

            expect(decl.properties).toHaveLength(0);

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with dependencies to another module", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iRefExt');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iRefExt");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".iRefExt.x', "x", false, "public", false, undefined, undefined, undefined);
            expectDeclaredType(prop.type, '"./src/secondary.ts".ExternalCustomInterface');
            expectDependency(dependencies, '"./src/main.ts".iRefExt.x', '"./src/secondary.ts".ExternalCustomInterface', 1);

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".iRefExt.method', "method", "public", undefined, undefined, undefined);
            expectDeclaredType(method.returnType, '"./src/secondary.ts".ExternalCustomClass');
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(dependencies, '"./src/main.ts".iRefExt.method', '"./src/secondary.ts".ExternalCustomClass', 1);

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with type parameters", async () => {
        const decl = interfaceDecls.get('"./src/main.ts".iGeneric');
        expect(decl).not.toBeNull();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.interfaceName).toBe("iGeneric");

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T");

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(2);
            const method = expectMethod(decl.methods, '"./src/main.ts".iGeneric.method', "method", "public", undefined, undefined, undefined);
            expectTypeParameterReference(method.returnType, "T");
            expect(method.parameters).toHaveLength(1);
            expectFunctionParameter(method.parameters, 0, "p1", false);
            expectTypeParameterReference(method.parameters[0]!.type, "T");
            expect(method.typeParameters).toHaveLength(0);

            const methodNested = expectMethod(decl.methods, '"./src/main.ts".iGeneric.methodNested', "methodNested", "public", undefined, undefined, undefined);
            expectTypeParameterReference(methodNested.returnType, "U");
            expect(methodNested.parameters).toHaveLength(2);
            expectFunctionParameter(methodNested.parameters, 0, "p1", false);
            expectTypeParameterReference(methodNested.parameters[0]!.type, "T");
            expectFunctionParameter(methodNested.parameters, 1, "p2", false);
            expectTypeParameterReference(methodNested.parameters[1]!.type, "U");

            expect(methodNested.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(methodNested.typeParameters, 0,"U");

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });
});
