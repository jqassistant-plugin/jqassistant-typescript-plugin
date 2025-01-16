import { processProjects } from "../../../src/core/extractor";
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
    resolveGlobalFqn,
} from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEInterfaceDeclaration } from "../../../src/core/concepts/interface-declaration.concept";
import { LCETypeNotIdentified, LCETypePrimitive, LCETypeUnion } from "../../../src/core/concepts/type.concept";

jest.setTimeout(30000);

describe("interface declarations test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/interface-declarations";
    let result: Map<string, object[]>;
    const interfaceDecls: Map<string, LCEInterfaceDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }
        result = projects[0].concepts;

        if (!result.get(LCEInterfaceDeclaration.conceptId)) {
            throw new Error("Could not find interface declarations in result data.");
        }

        for (const concept of result.get(LCEInterfaceDeclaration.conceptId) ?? []) {
            const interfaceDecl: LCEInterfaceDeclaration = concept as LCEInterfaceDeclaration;
            if (!interfaceDecl.fqn.globalFqn) {
                throw new Error("Interface declaration has no global FQN " + JSON.stringify(interfaceDecl));
            }
            if (interfaceDecls.has(interfaceDecl.fqn.globalFqn)) {
                throw new Error("Two interface declarations with same global FQN were returned: " + interfaceDecl.fqn.globalFqn);
            }
            interfaceDecls.set(interfaceDecl.fqn.globalFqn, interfaceDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("empty interface", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iEmpty'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iEmpty'));
            expect(decl.interfaceName).toBe("iEmpty");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("exported empty interface", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExported'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExported'));
            expect(decl.interfaceName).toBe("iExported");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExported'));

            expect(exportDeclConcept).toBeDefined();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("type");
                expect(exportDecl.identifier).toBe("iExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePathAbsolute).toBe(mainModule.fqn.globalFqn);
            }
        }
    });

    test("interface with properties", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iProperties'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iProperties'));
            expect(decl.interfaceName).toBe("iProperties");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(3);
            expectProperty(decl.properties, '"./src/main.ts".iProperties.x', "x", false, "public", false, undefined, undefined, undefined, "number");
            expectProperty(decl.properties, '"./src/main.ts".iProperties.a', "a", false, "public", true, undefined, undefined, undefined, "number");
            const propB = expectProperty(
                decl.properties,
                '"./src/main.ts".iProperties.b',
                "b",
                true,
                "public",
                false,
                undefined,
                undefined,
                undefined,
            );
            expectOptionalPrimitiveType(propB.type, "number");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with methods", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iMethods'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iMethods'));
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
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iGetterSetter'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iGetterSetter'));
            expect(decl.interfaceName).toBe("iGetterSetter");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(0);
            expect(decl.methods).toHaveLength(0);

            expect(decl.accessorProperties).toHaveLength(2);
            const accX = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".iGetterSetter.x', "x");
            expect(accX.autoAccessor).toBeUndefined();
            expect(accX.getter).toBeDefined();
            expectPrimitiveType(accX.getter!.returnType, "number");
            expect(accX.getter!.visibility).toBe("public");
            expect(accX.getter!.decorators).toHaveLength(0);
            expect(accX.getter!.override).toBeUndefined();
            expect(accX.getter!.abstract).toBeUndefined();
            expect(accX.getter!.isStatic).toBeUndefined();
            expect(accX.setter).toBeDefined();
            expectFunctionParameter(accX.setter!.parameters, 0, "x", false, "number");
            expect(accX.setter!.visibility).toBe("public");
            expect(accX.setter!.decorators).toHaveLength(0);
            expect(accX.setter!.override).toBeUndefined();
            expect(accX.setter!.abstract).toBeUndefined();
            expect(accX.setter!.isStatic).toBeUndefined();

            const accY = expectAccessorProperty(decl.accessorProperties, '"./src/main.ts".iGetterSetter.y', "y");
            expect(accY.getter).toBeUndefined();
            expect(accY.autoAccessor).toBeUndefined();
            expect(accY.setter).toBeDefined();
            expectFunctionParameter(accY.setter!.parameters, 0, "y", false, "number");
            expect(accY.setter!.visibility).toBe("public");
            expect(accY.setter!.decorators).toHaveLength(0);
            expect(accY.setter!.override).toBeUndefined();
            expect(accY.setter!.abstract).toBeUndefined();
            expect(accY.setter!.isStatic).toBeUndefined();
        }
    });

    test("interface extending another interface", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExtends'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExtends'));
            expect(decl.interfaceName).toBe("iExtends");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.extendsInterfaces[0], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iExtends',
                resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
                1,
            );

            expect(decl.properties).toHaveLength(1);
            expectProperty(
                decl.properties,
                '"./src/main.ts".iExtends.newProp',
                "newProp",
                false,
                "public",
                false,
                undefined,
                undefined,
                undefined,
                "string",
            );

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface extending multiple other interfaces", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExtendsMulti'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExtendsMulti'));
            expect(decl.interfaceName).toBe("iExtendsMulti");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(2);
            expectDeclaredType(decl.extendsInterfaces[0], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iExtendsMulti',
                resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
                1,
            );
            expectDeclaredType(decl.extendsInterfaces[1], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface2'));
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iExtendsMulti',
                resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface2'),
                1,
            );

            expect(decl.properties).toHaveLength(1);
            expectProperty(
                decl.properties,
                '"./src/main.ts".iExtendsMulti.newProp',
                "newProp",
                false,
                "public",
                false,
                undefined,
                undefined,
                undefined,
                "string",
            );

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with dependencies", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRef'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRef'));
            expect(decl.interfaceName).toBe("iRef");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".iRef.x', "x", false, "public", false, undefined, undefined, undefined);
            expectDeclaredType(prop.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iRef.x',
                resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
                1,
            );

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".iRef.method', "method", "public", undefined, undefined, undefined);
            expectDeclaredType(method.returnType, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'));
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iRef.method',
                resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'),
                1,
            );

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface extending an interface of another module", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExtendsExt'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iExtendsExt'));
            expect(decl.interfaceName).toBe("iExtendsExt");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(1);
            expectDeclaredType(decl.extendsInterfaces[0], resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iExtendsExt',
                resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'),
                1,
            );

            expect(decl.properties).toHaveLength(0);

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with dependencies to another module", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRefExt'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRefExt'));
            expect(decl.interfaceName).toBe("iRefExt");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(1);
            const prop = expectProperty(decl.properties, '"./src/main.ts".iRefExt.x', "x", false, "public", false, undefined, undefined, undefined);
            expectDeclaredType(prop.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iRefExt.x',
                resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'),
                1,
            );

            expect(decl.methods).toHaveLength(1);
            const method = expectMethod(decl.methods, '"./src/main.ts".iRefExt.method', "method", "public", undefined, undefined, undefined);
            expectDeclaredType(method.returnType, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'));
            expect(method.parameters).toHaveLength(0);
            expect(method.typeParameters).toHaveLength(0);
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.ts".iRefExt.method',
                resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'),
                1,
            );

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with type parameters", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iGeneric'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iGeneric'));
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

            const methodNested = expectMethod(
                decl.methods,
                '"./src/main.ts".iGeneric.methodNested',
                "methodNested",
                "public",
                undefined,
                undefined,
                undefined,
            );
            expectTypeParameterReference(methodNested.returnType, "U");
            expect(methodNested.parameters).toHaveLength(2);
            expectFunctionParameter(methodNested.parameters, 0, "p1", false);
            expectTypeParameterReference(methodNested.parameters[0]!.type, "T");
            expectFunctionParameter(methodNested.parameters, 1, "p2", false);
            expectTypeParameterReference(methodNested.parameters[1]!.type, "U");

            expect(methodNested.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(methodNested.typeParameters, 0, "U");

            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with recursive property", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRecursive'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRecursive'));
            expect(decl.interfaceName).toBe("iRecursive");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(2);
            expectProperty(decl.properties, '"./src/main.ts".iRecursive.a', "a", false, "public", false, undefined, undefined, undefined, "string");
            const propR = expectProperty(
                decl.properties,
                '"./src/main.ts".iRecursive.r',
                "r",
                true,
                "public",
                false,
                undefined,
                undefined,
                undefined,
            );
            expect(propR.type).toBeDefined();
            expect(propR.type.type).toBe("union");
            expect((propR.type as LCETypeUnion).types).toBeDefined();
            expect((propR.type as LCETypeUnion).types).toHaveLength(2);
            const propRTypes = (propR.type as LCETypeUnion).types;
            expect(propRTypes.find((t) => t.type === "primitive" && (t as LCETypePrimitive).name === "undefined")).toBeDefined();
            const propRDeclType = propRTypes.find((t) => t.type === "declared");
            expectDeclaredType(propRDeclType, resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRecursive'));

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });

    test("interface with recursive indexed access types", async () => {
        const decl = interfaceDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRecursiveIndexAccess'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".iRecursiveIndexAccess'));
            expect(decl.interfaceName).toBe("iRecursiveIndexAccess");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.extendsInterfaces).toHaveLength(0);

            expect(decl.properties).toHaveLength(3);

            const propA = expectProperty(
                decl.properties,
                '"./src/main.ts".iRecursiveIndexAccess.a',
                "a",
                false,
                "public",
                false,
                undefined,
                undefined,
                undefined,
            );
            expect(propA.type).toBeDefined();
            expect(propA.type.type).toBe("not-identified");
            expect((propA.type as LCETypeNotIdentified).identifier).toBe("Type contains indexed access type (potentially recursive)");

            // The following would represent a correct check with full type tracing: (TODO: implement fine-grained indexed access type resolution)
            // const propAObjType = expectObjectType(propA.type, 3);
            // expectObjectTypeMember(propAObjType, "a1", false, false, "string");
            // const propAObjTypeA2Member = expectObjectTypeMember(propAObjType, "a2", false, false);
            // const propAObjTypeA2MemberObjType = expectObjectType(propAObjTypeA2Member.type, 2);
            // expectObjectTypeMember(propAObjTypeA2MemberObjType, "a21", false, false, "string");
            // expectObjectTypeMember(propAObjTypeA2MemberObjType, "a22", false, false, "number");
            // const propAObjTypeAbMember = expectObjectTypeMember(propAObjType, "ab", true, false);
            // expect(propAObjTypeAbMember.type).toBeDefined();
            // expect(propAObjTypeAbMember.type.type).toBe("union");
            // expect((propAObjTypeAbMember.type as LCETypeUnion).types).toBeDefined();
            // const propAObjTypeAbMemberTypes = (propAObjTypeAbMember.type as LCETypeUnion).types;
            // expect(propAObjTypeAbMemberTypes).toHaveLength(2);
            // expect(propAObjTypeAbMemberTypes.find((t) => t.type === "primitive" && (t as LCETypePrimitive).name === "undefined")).toBeDefined();
            // const propAObjTypeAbMemberTypesIndexedAccessType = propAObjTypeAbMemberTypes.find((t) => t.type === "not-identified");
            // expect(propAObjTypeAbMemberTypesIndexedAccessType).toBeDefined();
            // expect((propAObjTypeAbMemberTypesIndexedAccessType as LCETypeNotIdentified).identifier).toBe(
            //     "Indexed Access Type (potentially recursive)",
            // );

            const propB = expectProperty(
                decl.properties,
                '"./src/main.ts".iRecursiveIndexAccess.b',
                "b",
                false,
                "public",
                false,
                undefined,
                undefined,
                undefined,
            );
            expect(propB.type).toBeDefined();
            expect(propB.type.type).toBe("not-identified");
            expect((propB.type as LCETypeNotIdentified).identifier).toBe("Type contains indexed access type (potentially recursive)");

            // The following would represent a correct check with full type tracing:
            // const propBObjType = expectObjectType(propB.type, 3);
            // expectObjectTypeMember(propBObjType, "b1", false, false, "string");
            // const propBObjTypeBaMember = expectObjectTypeMember(propBObjType, "ba", false, false);
            // const propBObjTypeBaMemberDeclType = expectDeclaredType(propBObjTypeBaMember.type, "Array", false);
            // expect(propBObjTypeBaMemberDeclType.typeArguments).toHaveLength(1);
            // expect(propBObjTypeBaMemberDeclType.typeArguments[0].type).toBe("not-identified");
            // expect((propBObjTypeBaMemberDeclType.typeArguments[0] as LCETypeNotIdentified).identifier).toBe(
            //     "Indexed Access Type (potentially recursive)",
            // );

            const propC = expectProperty(
                decl.properties,
                '"./src/main.ts".iRecursiveIndexAccess.c',
                "c",
                false,
                "public",
                false,
                undefined,
                undefined,
                undefined,
            );
            expect(propC.type).toBeDefined();
            expect(propC.type.type).toBe("object");

            expect(decl.methods).toHaveLength(0);
            expect(decl.accessorProperties).toHaveLength(0);
        }
    });
});
