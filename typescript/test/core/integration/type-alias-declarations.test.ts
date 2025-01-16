import { processProjects } from "../../../src/core/extractor";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectFunctionType,
    expectLiteralType,
    expectObjectType,
    expectObjectTypeMember,
    expectOptionalPrimitiveType,
    expectPrimitiveType,
    expectTypeParameterDeclaration,
    expectTypeParameterReference,
    getDependenciesFromResult,
    resolveGlobalFqn,
} from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCETypeAliasDeclaration } from "../../../src/core/concepts/type-alias-declaration.concept";
import {
    LCETypeDeclared,
    LCETypeFunctionParameter,
    LCETypeIntersection,
    LCETypeLiteral,
    LCETypePrimitive,
    LCETypeTuple,
    LCETypeUnion,
} from "../../../src/core/concepts/type.concept";

jest.setTimeout(30000);

describe("type alias declarations test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/type-alias-declarations";
    let result: Map<string, object[]>;
    const taDecls: Map<string, LCETypeAliasDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }
        result = projects[0].concepts;

        if (!result.get(LCETypeAliasDeclaration.conceptId)) {
            throw new Error("Could not find type alias declarations in result data.");
        }

        for (const concept of result.get(LCETypeAliasDeclaration.conceptId) ?? []) {
            const taDecl: LCETypeAliasDeclaration = concept as LCETypeAliasDeclaration;
            if (!taDecl.fqn.globalFqn) {
                throw new Error("Type alias declaration has no global FQN " + JSON.stringify(taDecl));
            }
            if (taDecls.has(taDecl.fqn.globalFqn)) {
                throw new Error("Two type alias declarations with same global FQN were returned: " + taDecl.fqn.globalFqn);
            }
            taDecls.set(taDecl.fqn.globalFqn, taDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("type alias of primitive type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tPrimitive'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tPrimitive'));
            expect(decl.typeAliasName).toBe("tPrimitive");

            expect(decl.typeParameters).toHaveLength(0);

            expectPrimitiveType(decl.type, "number");
        }
    });

    test("exported type alias", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tExported'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tExported'));
            expect(decl.typeAliasName).toBe("tExported");

            expect(decl.typeParameters).toHaveLength(0);

            expectPrimitiveType(decl.type, "number");

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/main.ts".tExported'));

            expect(exportDeclConcept).toBeDefined();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("type");
                expect(exportDecl.identifier).toBe("tExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePathAbsolute).toBe(mainModule.fqn.globalFqn);
            }
        }
    });

    test("type alias of class", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredClass'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredClass'));
            expect(decl.typeAliasName).toBe("tDeclaredClass");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tDeclaredClass',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'),
            1,
        );
    });

    test("type alias of interface", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredInterface'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredInterface'));
            expect(decl.typeAliasName).toBe("tDeclaredInterface");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tDeclaredInterface',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
            1,
        );
    });

    test("type alias of type alias", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredTypeAlias'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredTypeAlias'));
            expect(decl.typeAliasName).toBe("tDeclaredTypeAlias");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tDeclaredTypeAlias',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("type alias of enum", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredEnum'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredEnum'));
            expect(decl.typeAliasName).toBe("tDeclaredEnum");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tDeclaredEnum',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'),
            1,
        );
    });

    test("type alias of class with type arguments", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredTypeArgs'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredTypeArgs'));
            expect(decl.typeAliasName).toBe("tDeclaredTypeArgs");

            expect(decl.typeParameters).toHaveLength(0);

            const declType = expectDeclaredType(decl.type, "Map", false);
            expect(declType.typeArguments).toBeDefined();
            expect(declType.typeArguments).toHaveLength(2);
            expectPrimitiveType(declType.typeArguments[0], "string");
            expectPrimitiveType(declType.typeArguments[1], "number");
        }
    });

    test("type alias of class of other module", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredExternal'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tDeclaredExternal'));
            expect(decl.typeAliasName).toBe("tDeclaredExternal");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tDeclaredExternal',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'),
            1,
        );
    });

    test("type alias of union type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tUnion'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tUnion'));
            expect(decl.typeAliasName).toBe("tUnion");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeUnion.typeId);
            const unionTypes = (decl.type as LCETypeUnion).types;
            expect(unionTypes).toHaveLength(2);
            expectPrimitiveType(unionTypes[0], "string");
            expectDeclaredType(unionTypes[1], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tUnion',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
            1,
        );
    });

    test("type alias of intersection type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tIntersection'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tIntersection'));
            expect(decl.typeAliasName).toBe("tIntersection");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeIntersection.typeId);
            const intersectionTypes = (decl.type as LCETypeIntersection).types;
            expect(intersectionTypes).toHaveLength(2);
            const objectType = expectObjectType(intersectionTypes[0], 1);
            expectObjectTypeMember(objectType, "z", false, false, "number");
            expectDeclaredType(intersectionTypes[1], resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tIntersection',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("type alias of object type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tObject'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tObject'));
            expect(decl.typeAliasName).toBe("tObject");

            expect(decl.typeParameters).toHaveLength(0);

            const oType = expectObjectType(decl.type, 6);
            expectObjectTypeMember(oType, "x", false, false, "number");
            const memY = expectObjectTypeMember(oType, "y", false, false);
            expectDeclaredType(memY.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'));
            expectObjectTypeMember(oType, "z", false, true, "number");
            const memW = expectObjectTypeMember(oType, "w", true, false);
            expectOptionalPrimitiveType(memW.type, "number");
            const memFun = expectObjectTypeMember(oType, "fun", false, false);
            const funType = expectFunctionType(memFun.type, 1, "string");
            expectFunctionParameter(funType.parameters, 0, "p1", false, "string");
            const memMethod = expectObjectTypeMember(oType, "method", false, false);
            const methodType = expectFunctionType(memMethod.type, 1, "number");
            expectFunctionParameter(methodType.parameters, 0, "px", false, "string");
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tObject',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("type alias of exported object type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tObjectExported'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tObjectExported'));
            expect(decl.typeAliasName).toBe("tObjectExported");

            expect(decl.typeParameters).toHaveLength(0);

            const oType = expectObjectType(decl.type, 1);
            const memX = expectObjectTypeMember(oType, "x", false, false);
            expectDeclaredType(memX.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tObjectExported',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("type alias of function type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tFunction'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tFunction'));
            expect(decl.typeAliasName).toBe("tFunction");

            expect(decl.typeParameters).toHaveLength(0);

            const fType = expectFunctionType(decl.type, 2, "string");
            expectFunctionParameter(fType.parameters, 0, "p1", false, "number");
            expectFunctionParameter(fType.parameters, 1, "p2", true);
            expectOptionalPrimitiveType((fType.parameters[1] as LCETypeFunctionParameter).type, "string");
        }
    });

    test("type alias of literal type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tLiteral'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tLiteral'));
            expect(decl.typeAliasName).toBe("tLiteral");

            expect(decl.typeParameters).toHaveLength(0);

            expectLiteralType(decl.type, LCETypeLiteral.typeId);
        }
    });

    test("type alias of tuple type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tTuple'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tTuple'));
            expect(decl.typeAliasName).toBe("tTuple");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeTuple.typeId);
            const types = (decl.type as LCETypeTuple).types;
            expect(types).toBeDefined();
            expect(types).toHaveLength(2);
            expectPrimitiveType(types[0], "number");
            expectPrimitiveType(types[1], "string");
        }
    });

    test("type alias of named tuple type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tTupleNamed'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tTupleNamed'));
            expect(decl.typeAliasName).toBe("tTupleNamed");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeTuple.typeId);
            const types = (decl.type as LCETypeTuple).types;
            expect(types).toBeDefined();
            expect(types).toHaveLength(2);
            expectPrimitiveType(types[0], "number");
            expectPrimitiveType(types[1], "boolean");
        }
    });

    test("type alias of object type with type parameters", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tGeneric'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tGeneric'));
            expect(decl.typeAliasName).toBe("tGeneric");

            expect(decl.typeParameters).toHaveLength(2);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "K");
            expectTypeParameterDeclaration(decl.typeParameters, 1, "V", false);
            expectDeclaredType(decl.typeParameters[1].constraint, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'));

            const oType = expectObjectType(decl.type, 2);
            const memKey = expectObjectTypeMember(oType, "key", false, false);
            expectTypeParameterReference(memKey.type, "K");
            const memValue = expectObjectTypeMember(oType, "value", false, false);
            expectTypeParameterReference(memValue.type, "V");
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tGeneric',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("type alias of template literal type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tTemplateLiteralType'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tTemplateLiteralType'));
            expect(decl.typeAliasName).toBe("tTemplateLiteralType");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeUnion.typeId);
            expect((decl.type as LCETypeUnion).types).toBeDefined();
            expect((decl.type as LCETypeUnion).types).toHaveLength(4);
            (decl.type as LCETypeUnion).types.forEach((t) => {
                expect(t.type).toBe(LCETypeLiteral.typeId);
            });
        }
    });

    test("type alias of recursive type", async () => {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tRecursive'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".tRecursive'));
            expect(decl.typeAliasName).toBe("tRecursive");

            expect(decl.typeParameters).toHaveLength(0);

            const oType = expectObjectType(decl.type, 2);
            expectObjectTypeMember(oType, "a", false, false, "string");
            const memR = expectObjectTypeMember(oType, "r", true, false);
            expect(memR.type).toBeDefined();
            expect(memR.type.type).toBe(LCETypeUnion.typeId);
            expect((memR.type as LCETypeUnion).types).toBeDefined();
            expect((memR.type as LCETypeUnion).types).toHaveLength(2);
            const memRTypes = (memR.type as LCETypeUnion).types;
            expect(memRTypes.find((t) => t.type === LCETypePrimitive.typeId && (t as LCETypePrimitive).name === "undefined")).toBeDefined();
            const memRDeclType = memRTypes.find((t) => t.type === LCETypeDeclared.typeId);
            expectDeclaredType(memRDeclType, resolveGlobalFqn(projectRootPath, '"./src/main.ts".tRecursive'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".tObject',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });
});
