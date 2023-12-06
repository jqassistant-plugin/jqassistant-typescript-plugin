import { processProject } from "../../../src/core/extractor";
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
} from "../../utils/test-utils";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCETypeAliasDeclaration } from "../../../src/core/concepts/type-alias-declaration.concept";
import { tExported } from "./sample-projects/type-alias-declarations/src/main";
import { LCETypeFunctionParameter, LCETypeIntersection, LCETypeTuple, LCETypeUnion } from "../../../src/core/concepts/type.concept";

jest.setTimeout(30000);

describe("type alias declarations test", () => {
    let result: Map<string, object[]>;
    const taDecls: Map<string, LCETypeAliasDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/type-alias-declarations";
        result = await processProject(projectRoot);

        if (!result.get(LCETypeAliasDeclaration.conceptId)) {
            throw new Error("Could not find type alias declarations in result data.");
        }

        for (const concept of result.get(LCETypeAliasDeclaration.conceptId) ?? []) {
            const taDecl: LCETypeAliasDeclaration = concept as LCETypeAliasDeclaration;
            if (!taDecl.fqn) {
                throw new Error("Type alias declaration has no fqn " + JSON.stringify(taDecl));
            }
            if (taDecls.has(taDecl.fqn)) {
                throw new Error("Two type alias declarations with same FQN were returned: " + taDecl.fqn);
            }
            taDecls.set(taDecl.fqn, taDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("type alias of primitive type", async () => {
        const decl = taDecls.get('"./src/main.ts".tPrimitive');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tPrimitive");

            expect(decl.typeParameters).toHaveLength(0);

            expectPrimitiveType(decl.type, "number");
        }
    });

    test("exported type alias", async () => {
        const decl = taDecls.get('"./src/main.ts".tExported');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tExported");

            expect(decl.typeParameters).toHaveLength(0);

            expectPrimitiveType(decl.type, "number");

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).declFqn === '"./src/main.ts".tExported');

            expect(exportDeclConcept).toBeDefined();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("type");
                expect(exportDecl.identifier).toBe("tExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePath).toBe(mainModule.fqn);
            }
        }
    });

    test("type alias of class", async () => {
        const decl = taDecls.get('"./src/main.ts".tDeclaredClass');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tDeclaredClass");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, '"./src/main.ts".CustomClass');
        }

        expectDependency(dependencies, '"./src/main.ts".tDeclaredClass', '"./src/main.ts".CustomClass', 1);
    });

    test("type alias of interface", async () => {
        const decl = taDecls.get('"./src/main.ts".tDeclaredInterface');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tDeclaredInterface");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, '"./src/main.ts".CustomInterface');
        }

        expectDependency(dependencies, '"./src/main.ts".tDeclaredInterface', '"./src/main.ts".CustomInterface', 1);
    });

    test("type alias of type alias", async () => {
        const decl = taDecls.get('"./src/main.ts".tDeclaredTypeAlias');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tDeclaredTypeAlias");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, '"./src/main.ts".CustomType');
        }

        expectDependency(dependencies, '"./src/main.ts".tDeclaredTypeAlias', '"./src/main.ts".CustomType', 1);

    });

    test("type alias of enum", async () => {
        const decl = taDecls.get('"./src/main.ts".tDeclaredEnum');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tDeclaredEnum");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, '"./src/main.ts".CustomEnum');
        }

        expectDependency(dependencies, '"./src/main.ts".tDeclaredEnum', '"./src/main.ts".CustomEnum', 1);
    });

    test("type alias of class with type arguments", async () => {
        const decl = taDecls.get('"./src/main.ts".tDeclaredTypeArgs');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
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
        const decl = taDecls.get('"./src/main.ts".tDeclaredExternal');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tDeclaredExternal");

            expect(decl.typeParameters).toHaveLength(0);

            expectDeclaredType(decl.type, '"./src/secondary.ts".ExternalCustomClass');
        }

        expectDependency(dependencies, '"./src/main.ts".tDeclaredExternal', '"./src/secondary.ts".ExternalCustomClass', 1);
    });

    test("type alias of union type", async () => {
        const decl = taDecls.get('"./src/main.ts".tUnion');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tUnion");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("union");
            const unionTypes = (decl.type as LCETypeUnion).types;
            expect(unionTypes).toHaveLength(2);
            expectPrimitiveType(unionTypes[0], "string");
            expectDeclaredType(unionTypes[1], '"./src/main.ts".CustomInterface');
        }

        expectDependency(dependencies, '"./src/main.ts".tUnion', '"./src/main.ts".CustomInterface', 1);
    });

    test("type alias of intersection type", async () => {
        const decl = taDecls.get('"./src/main.ts".tIntersection');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tIntersection");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("intersection");
            const intersectionTypes = (decl.type as LCETypeIntersection).types;
            expect(intersectionTypes).toHaveLength(2);
            const objectType = expectObjectType(intersectionTypes[0], 1);
            expectObjectTypeMember(objectType, "z", false, false, "number");
            expectDeclaredType(intersectionTypes[1], '"./src/main.ts".CustomType');
        }

        expectDependency(dependencies, '"./src/main.ts".tIntersection', '"./src/main.ts".CustomType', 1);
    });

    test("type alias of object type", async () => {
        const decl = taDecls.get('"./src/main.ts".tObject');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tObject");

            expect(decl.typeParameters).toHaveLength(0);

            const oType = expectObjectType(decl.type, 6);
            expectObjectTypeMember(oType, "x", false, false, "number");
            const memY = expectObjectTypeMember(oType, "y", false, false);
            expectDeclaredType(memY.type, '"./src/main.ts".CustomType');
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

        expectDependency(dependencies, '"./src/main.ts".tObject', '"./src/main.ts".CustomType', 1);
    });

    test("type alias of exported object type", async () => {
        const decl = taDecls.get('"./src/main.ts".tObjectExported');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tObjectExported");

            expect(decl.typeParameters).toHaveLength(0);

            const oType = expectObjectType(decl.type, 1);
            const memX = expectObjectTypeMember(oType, "x", false, false);
            expectDeclaredType(memX.type, '"./src/main.ts".CustomType');
        }

        expectDependency(dependencies, '"./src/main.ts".tObjectExported', '"./src/main.ts".CustomType', 1);
    });

    test("type alias of function type", async () => {
        const decl = taDecls.get('"./src/main.ts".tFunction');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tFunction");

            expect(decl.typeParameters).toHaveLength(0);

            const fType = expectFunctionType(decl.type, 2, "string");
            expectFunctionParameter(fType.parameters, 0, "p1", false, "number");
            expectFunctionParameter(fType.parameters, 1, "p2", true);
            expectOptionalPrimitiveType((fType.parameters[1] as LCETypeFunctionParameter).type, "string");
        }
    });

    test("type alias of literal type", async () => {
        const decl = taDecls.get('"./src/main.ts".tLiteral');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tLiteral");

            expect(decl.typeParameters).toHaveLength(0);

            expectLiteralType(decl.type, "literal");
        }
    });

    test("type alias of tuple type", async () => {
        const decl = taDecls.get('"./src/main.ts".tTuple');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tTuple");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("tuple");
            const types = (decl.type as LCETypeTuple).types;
            expect(types).toBeDefined();
            expect(types).toHaveLength(2);
            expectPrimitiveType(types[0], "number");
            expectPrimitiveType(types[1], "string");
        }
    });

    test("type alias of named tuple type", async () => {
        const decl = taDecls.get('"./src/main.ts".tTupleNamed');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tTupleNamed");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("tuple");
            const types = (decl.type as LCETypeTuple).types;
            expect(types).toBeDefined();
            expect(types).toHaveLength(2);
            expectPrimitiveType(types[0], "number");
            expectPrimitiveType(types[1], "boolean");
        }
    });

    test("type alias of object type with type parameters", async () => {
        const decl = taDecls.get('"./src/main.ts".tGeneric');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tGeneric");

            expect(decl.typeParameters).toHaveLength(2);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "K");
            expectTypeParameterDeclaration(decl.typeParameters, 1, "V", false);
            expectDeclaredType(decl.typeParameters[1].constraint, '"./src/main.ts".CustomType');

            const oType = expectObjectType(decl.type, 2);
            const memKey = expectObjectTypeMember(oType, "key", false, false);
            expectTypeParameterReference(memKey.type, "K");
            const memValue = expectObjectTypeMember(oType, "value", false, false);
            expectTypeParameterReference(memValue.type, "V");
        }

        expectDependency(dependencies, '"./src/main.ts".tGeneric', '"./src/main.ts".CustomType', 1);
    });

    test("type alias of template literal type", async () => {
        const decl = taDecls.get('"./src/main.ts".tTemplateLiteralType');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.typeAliasName).toBe("tTemplateLiteralType");

            expect(decl.typeParameters).toHaveLength(0);

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("union");
            expect((decl.type as LCETypeUnion).types).toBeDefined();
            expect((decl.type as LCETypeUnion).types).toHaveLength(4);
            (decl.type as LCETypeUnion).types.forEach((t) => {
                expect(t.type).toBe("literal");
            })
        }
    });
});
