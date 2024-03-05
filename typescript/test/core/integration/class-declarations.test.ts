import { processProjects } from "../../../src/core/extractor";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectAccessorProperty,
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectLiteralType,
    expectMethod,
    expectOptionalPrimitiveType,
    expectPrimitiveType,
    expectProperty,
    expectTypeParameterDeclaration,
    expectTypeParameterReference,
    getDependenciesFromResult,
    resolveGlobalFqn,
} from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEClassDeclaration } from "../../../src/core/concepts/class-declaration.concept";

jest.setTimeout(30000);

describe("class declarations test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/class-declarations";
    let result: Map<string, object[]>;
    const classDecls: Map<string, LCEClassDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;
    let indexModule: LCEModule;

    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if(projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.")
        }
        result = projects[0].concepts;

        if (!result.get(LCEClassDeclaration.conceptId)) {
            throw new Error("Could not find class declarations in result data.");
        }

        for (const concept of result.get(LCEClassDeclaration.conceptId) ?? []) {
            const classDecl: LCEClassDeclaration = concept as LCEClassDeclaration;
            if (!classDecl.fqn.localFqn) {
                throw new Error("Class declaration has no local FQN " + JSON.stringify(classDecl));
            }
            if (classDecls.has(classDecl.fqn.localFqn)) {
                throw new Error("Two class declarations with same FQN were returned: " + classDecl.fqn.localFqn);
            }
            classDecls.set(classDecl.fqn.localFqn, classDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;
        const indexModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/subdir/index.ts");
        if (!indexModuleConcept) {
            throw new Error("Could not find index module in result data");
        }
        indexModule = indexModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("empty class", async () => {
        const decl = classDecls.get('"./src/main.ts".cEmpty');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cEmpty'));
            expect(decl.className).toBe("cEmpty");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with properties", async () => {
        const decl = classDecls.get('"./src/main.ts".cProperties');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cProperties'));
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
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with constructor", async () => {
        const decl = classDecls.get('"./src/main.ts".cConstructor');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cConstructor'));
            expect(decl.className).toBe("cConstructor");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeDefined();
            if(decl.constr) {
                expect(decl.constr.fqn.localFqn).toBe('"./src/main.ts".cConstructor.constructor');
                expect(decl.constr.parameters).toHaveLength(2);
                expectFunctionParameter(decl.constr.parameters, 0, "x", false, "number");
                expectFunctionParameter(decl.constr.parameters, 1, "y", false, "number");
                expect(decl.constr.parameterProperties).toHaveLength(0);
            }
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cConstructor.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cConstructor.y', "y", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with methods", async () => {
        const decl = classDecls.get('"./src/main.ts".cMethods');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cMethods'));
            expect(decl.className).toBe("cMethods");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(6);
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
            const methodAsync = expectMethod(decl.methods, '"./src/main.ts".cMethods.mAsync', "mAsync", "public", false, false, false, undefined, true);
            const declaredType = expectDeclaredType(methodAsync.returnType, "Promise", false);
            expect(declaredType.typeArguments).toHaveLength(1);
            expectPrimitiveType(declaredType.typeArguments[0], "number");
            expect(methodAsync.parameters).toHaveLength(1);
            expectFunctionParameter(methodAsync.parameters, 0, "p1", false, "number");
            expect(methodAsync.typeParameters).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with getters and setters", async () => {
        const decl = classDecls.get('"./src/main.ts".cGetterSetter');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cGetterSetter'));
            expect(decl.className).toBe("cGetterSetter");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(2);
            const accX = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".cGetterSetter.x', "x");
            expect(accX.autoAccessor).toBeUndefined();
            expect(accX.getter).toBeDefined();
            expectPrimitiveType(accX.getter!.returnType, "number");
            expect(accX.getter!.visibility).toBe("public");
            expect(accX.getter!.decorators).toHaveLength(0);
            expect(accX.getter!.override).toBe(false);
            expect(accX.getter!.abstract).toBe(false);
            expect(accX.getter!.isStatic).toBe(false);
            expect(accX.setter).toBeDefined();
            expectFunctionParameter(accX.setter!.parameters, 0, "x", false, "number");
            expect(accX.setter!.visibility).toBe("public");
            expect(accX.setter!.decorators).toHaveLength(0);
            expect(accX.setter!.override).toBe(false);
            expect(accX.setter!.abstract).toBe(false);
            expect(accX.setter!.isStatic).toBe(false);

            const accY = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".cGetterSetter.y', "y");
            expect(accY.getter).toBeUndefined();
            expect(accY.autoAccessor).toBeUndefined();
            expect(accY.setter).toBeDefined();
            expectFunctionParameter(accY.setter!.parameters, 0, "y", false, "number");
            expect(accY.setter!.visibility).toBe("private");
            expect(accY.setter!.decorators).toHaveLength(0);
            expect(accY.setter!.override).toBe(false);
            expect(accY.setter!.abstract).toBe(false);
            expect(accY.setter!.isStatic).toBe(false);
            
            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with an auto accessor", async () => {
        const decl = classDecls.get('"./src/main.ts".cAutoAccessor');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cAutoAccessor'));
            expect(decl.className).toBe("cAutoAccessor");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(1);
            const accA = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".cAutoAccessor.a', "a");
            expect(accA.getter).toBeUndefined();
            expect(accA.setter).toBeUndefined();
            expect(accA.autoAccessor).toBeDefined();
            expectPrimitiveType(accA.autoAccessor!.type, "number");
            expect(accA.autoAccessor!.visibility).toBe("public");
            expect(accA.autoAccessor!.decorators).toHaveLength(0);
            expect(accA.autoAccessor!.override).toBe(false);
            expect(accA.autoAccessor!.abstract).toBe(false);
            expect(accA.autoAccessor!.isStatic).toBe(false);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with parameter properties", async () => {
        const decl = classDecls.get('"./src/main.ts".cParameterProperties');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cParameterProperties'));
            expect(decl.className).toBe("cParameterProperties");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeDefined();
            if(decl.constr) {
                expect(decl.constr.fqn.localFqn).toBe('"./src/main.ts".cParameterProperties.constructor');
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
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with static members", async () => {
        const decl = classDecls.get('"./src/main.ts".cStatic');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cStatic'));
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

            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("exported class", async () => {
        const decl = classDecls.get('"./src/main.ts".cExported');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cExported'));
            expect(decl.className).toBe("cExported");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeDefined();
            if(decl.constr) {
                expect(decl.constr.fqn.localFqn).toBe('"./src/main.ts".cExported.constructor');
                expect(decl.constr.parameters).toHaveLength(0);
                expect(decl.constr.parameterProperties).toHaveLength(0);
            }
            expect(decl.properties).toHaveLength(3);
            expectProperty(decl.properties, '"./src/main.ts".cExported._x', "_x", false, "private", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cExported.pub', "pub", false, "public", false, false, false, false, "string");
            expectProperty(decl.properties, '"./src/main.ts".cExported.STATIC', "STATIC", false, "public", false, false, false, true, "number");

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".cExported.method', "method", "public", false, false, false, "string");
            expect(method.parameters).toHaveLength(1);
            expectFunctionParameter(method.parameters, 0, "p1", false, "number");
            expect(method.typeParameters).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/main.ts".cExported'));

            expect(exportDeclConcept).toBeDefined();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("value");
                expect(exportDecl.identifier).toBe("cExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePathAbsolute).toBe(mainModule.fqn.globalFqn);
            }
        }
    });

    test("abstract class", async () => {
        const decl = classDecls.get('"./src/main.ts".cAbstract');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cAbstract'));
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

            expect(decl.accessorProperties).toHaveLength(1);
            const accA = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".cAbstract.abstractAcc', "abstractAcc");
            expect(accA.getter).toBeUndefined();
            expect(accA.setter).toBeUndefined();
            expect(accA.autoAccessor).toBeDefined();
            expectPrimitiveType(accA.autoAccessor!.type, "string");
            expect(accA.autoAccessor!.visibility).toBe("public");
            expect(accA.autoAccessor!.decorators).toHaveLength(0);
            expect(accA.autoAccessor!.override).toBe(false);
            expect(accA.autoAccessor!.abstract).toBe(true);
            expect(accA.autoAccessor!.isStatic).toBe(false);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class extending another class", async () => {
        const decl = classDecls.get('"./src/main.ts".cExtends');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cExtends'));
            expect(decl.className).toBe("cExtends");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.extendsClass, resolveGlobalFqn(projectRootPath,'"./src/main.ts".CustomClass'));
            expectDependency(projectRootPath, dependencies,'"./src/main.ts".cExtends', resolveGlobalFqn(projectRootPath,'"./src/main.ts".CustomClass'), 1);
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".cExtends.x', "x", false, "public", false, true, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class implementing an interface", async () => {
        const decl = classDecls.get('"./src/main.ts".cImplements');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cImplements'));
            expect(decl.className).toBe("cImplements");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.implementsInterfaces[0], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
            expectDependency(projectRootPath, dependencies,'"./src/main.ts".cImplements', resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'), 1);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cImplements.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplements.y', "y", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class implementing multiple interfaces", async () => {
        const decl = classDecls.get('"./src/main.ts".cImplementsMulti');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cImplementsMulti'));
            expect(decl.className).toBe("cImplementsMulti");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(2);
            expectDeclaredType(decl.implementsInterfaces[0], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
            expectDependency(projectRootPath, dependencies,'"./src/main.ts".cImplementsMulti', resolveGlobalFqn(projectRootPath,'"./src/main.ts".CustomInterface'), 1);
            expectDeclaredType(decl.implementsInterfaces[1], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface2'));
            expectDependency(projectRootPath, dependencies,'"./src/main.ts".cImplementsMulti', resolveGlobalFqn(projectRootPath,'"./src/main.ts".CustomInterface2'), 1);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(3);
            expectProperty(decl.properties, '"./src/main.ts".cImplementsMulti.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplementsMulti.y', "y", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplementsMulti.str', "str", false, "public", false, false, false, false, "string");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with dependencies", async () => {
        const decl = classDecls.get('"./src/main.ts".cRef');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cRef'));
            expect(decl.className).toBe("cRef");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".cRef.x', "x", false, "public", false, false, false, false);
            expectDeclaredType(prop.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
            expectDependency(projectRootPath, dependencies, '"./src/main.ts".cRef.x', resolveGlobalFqn(projectRootPath,'"./src/main.ts".CustomInterface'), 1);

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".cRef.method', "method", "public", false, false, false);
            expectDeclaredType(method.returnType, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'));
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(projectRootPath, dependencies, '"./src/main.ts".cRef.method', resolveGlobalFqn(projectRootPath,'"./src/main.ts".CustomClass'), 2);

            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class extending a class of another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cExtendsExt');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cExtendsExt'));
            expect(decl.className).toBe("cExtendsExt");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.extendsClass, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'));
            expectDependency(projectRootPath, dependencies,'"./src/main.ts".cExtendsExt', resolveGlobalFqn(projectRootPath,'"./src/secondary.ts".ExternalCustomClass'), 1);
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/main.ts".cExtendsExt.x', "x", false, "public", false, true, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class implementing an interface of another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cImplementsExt');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cImplementsExt'));
            expect(decl.className).toBe("cImplementsExt");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.implementsInterfaces[0], resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));
            expectDependency(projectRootPath, dependencies,'"./src/main.ts".cImplementsExt', resolveGlobalFqn(projectRootPath,'"./src/secondary.ts".ExternalCustomInterface'), 1);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".cImplementsExt.x', "x", false, "public", false, false, false, false, "number");
            expectProperty(decl.properties, '"./src/main.ts".cImplementsExt.y', "y", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with dependencies to another module", async () => {
        const decl = classDecls.get('"./src/main.ts".cRefExt');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cRefExt'));
            expect(decl.className).toBe("cRefExt");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".cRefExt.x', "x", false, "public", false, false, false, false);
            expectDeclaredType(prop.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));
            expectDependency(projectRootPath, dependencies, '"./src/main.ts".cRefExt.x', resolveGlobalFqn(projectRootPath,'"./src/secondary.ts".ExternalCustomInterface'), 1);

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".cRefExt.method', "method", "public", false, false, false);
            expectDeclaredType(method.returnType, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'));
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(projectRootPath, dependencies, '"./src/main.ts".cRefExt.method', resolveGlobalFqn(projectRootPath,'"./src/secondary.ts".ExternalCustomClass'), 2);

            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class with type parameters", async () => {
        const decl = classDecls.get('"./src/main.ts".cGeneric');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".cGeneric'));
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

            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });

    test("class in index.ts", async () => {
        const decl = classDecls.get('"./src/subdir".cIndex');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(indexModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/subdir".cIndex'));
            expect(decl.className).toBe("cIndex");
            expect(decl.abstract).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsClass).toBeUndefined();
            expect(decl.implementsInterfaces).toHaveLength(0);

            expect(decl.constr).toBeUndefined();
            expect(decl.properties).toHaveLength(1);
            expectProperty(decl.properties, '"./src/subdir".cIndex.x', "x", false, "public", false, false, false, false, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            expect(decl.decorators).toHaveLength(0);
        }
    });
});
