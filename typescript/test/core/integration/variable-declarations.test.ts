import { processProjects } from "../../../src/core/extractor";
import { LCEVariableDeclaration } from "../../../src/core/concepts/variable-declaration.concept";
import {
    LCEType,
    LCETypeDeclared,
    LCETypeFunction,
    LCETypeIntersection,
    LCETypeNotIdentified,
    LCETypeObject,
    LCETypePrimitive,
    LCETypeTuple,
    LCETypeUnion,
} from "../../../src/core/concepts/type.concept";
import {
    LCEValueArray,
    LCEValueCall,
    LCEValueClass,
    LCEValueComplex,
    LCEValueDeclared,
    LCEValueFunction,
    LCEValueLiteral,
    LCEValueMember,
    LCEValueNull,
    LCEValueObject,
} from "../../../src/core/concepts/value.concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectLiteralType,
    expectLiteralValue,
    expectObjectType,
    expectObjectTypeMember,
    expectPrimitiveType,
    getDependenciesFromResult,
    resolveGlobalFqn,
} from "../../utils/test-utils";

jest.setTimeout(30000);

describe("variable declarations test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/variable-declarations";
    let result: Map<string, object[]>;
    const varDecls: Map<string, LCEVariableDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
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
            if (!varDecl.fqn.globalFqn) {
                throw new Error("Variable declaration has no global FQN " + JSON.stringify(varDecl));
            }
            if (varDecls.has(varDecl.fqn.globalFqn)) {
                throw new Error("Two variable declarations with same global FQN were returned: " + varDecl.fqn.globalFqn);
            }
            varDecls.set(varDecl.fqn.globalFqn, varDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("var x;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vVarUninitialized'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vVarUninitialized'));
            expect(decl.variableName).toBe("vVarUninitialized");
            expect(decl.kind).toBe("var");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeUndefined();
        }
    });

    test("let x;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vLetUninitialized'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vLetUninitialized'));
            expect(decl.variableName).toBe("vLetUninitialized");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeUndefined();
        }
    });

    test("var x = 0;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vVarInit'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vVarInit'));
            expect(decl.variableName).toBe("vVarInit");
            expect(decl.kind).toBe("var");

            expectPrimitiveType(decl.type, "number");
            expectLiteralValue(decl.initValue, 0, "number");
        }
    });

    test("let x = 0;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vLetInit'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vLetInit'));
            expect(decl.variableName).toBe("vLetInit");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");
            expectLiteralValue(decl.initValue, 0, "number");
        }
    });

    test("const x = 0;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vConstInit'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vConstInit'));
            expect(decl.variableName).toBe("vConstInit");
            expect(decl.kind).toBe("const");

            expectLiteralType(decl.type, 0);
            expectLiteralValue(decl.initValue, 0, "number");
        }
    });

    test("let x1 = 1, x2 = 2;", async () => {
        for (let i = 1; i <= 2; i++) {
            const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vMulti' + i));
            expect(decl).toBeDefined();
            if (decl) {
                expect(decl.coordinates.fileName).toBe(mainModule.path);
                expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vMulti' + i));
                expect(decl.variableName).toBe("vMulti" + i);
                expect(decl.kind).toBe("let");

                expectPrimitiveType(decl.type, "number");
                expectLiteralValue(decl.initValue, i, "number");
            }
        }
    });

    test("export let x = 5;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExported'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExported'));
            expect(decl.variableName).toBe("vExported");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");
            expectLiteralValue(decl.initValue, 5, "number");
        }

        const exportDeclConcept = result
            .get(LCEExportDeclaration.conceptId)
            ?.find((exp) => (exp as LCEExportDeclaration).globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExported'));

        expect(exportDeclConcept).toBeDefined();
        if (exportDeclConcept) {
            const exportDecl = exportDeclConcept as LCEExportDeclaration;
            expect(exportDecl.kind).toBe("value");
            expect(exportDecl.identifier).toBe("vExported");
            expect(exportDecl.alias).toBeUndefined();
            expect(exportDecl.isDefault).toBe(false);
            expect(exportDecl.sourceFilePathAbsolute).toBe(mainModule.fqn.globalFqn);
        }
    });

    test("let x = undefined;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vUndefined'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vUndefined'));
            expect(decl.variableName).toBe("vUndefined");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueNull.valueTypeId);
                expect((decl.initValue as LCEValueNull).kind).toBe("undefined");
                expectPrimitiveType(decl.initValue.type, "undefined");
            }
        }
    });

    test("let x = null;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vNull'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vNull'));
            expect(decl.variableName).toBe("vNull");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueNull.valueTypeId);
                expect((decl.initValue as LCEValueNull).kind).toBe("null");
                expectPrimitiveType(decl.initValue.type, "null");
            }
        }
    });

    test("let x = true;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vTrue'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vTrue'));
            expect(decl.variableName).toBe("vTrue");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "boolean");
            expectLiteralValue(decl.initValue, true, "boolean");
        }
    });

    test("let x = false;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vFalse'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vFalse'));
            expect(decl.variableName).toBe("vFalse");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "boolean");
            expectLiteralValue(decl.initValue, false, "boolean");
        }
    });

    test('let x = "1";', async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vString'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vString'));
            expect(decl.variableName).toBe("vString");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "string");
            expectLiteralValue(decl.initValue, "1", "string");
        }
    });

    test("let x = {...};", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vObject'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vObject'));
            expect(decl.variableName).toBe("vObject");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeObject.typeId);

            function checkObjectType(type: LCEType) {
                const oType = expectObjectType(type, 2);
                expectObjectTypeMember(oType, "a", false, false, "number");
                expectObjectTypeMember(oType, "b", false, false, "string");
            }

            checkObjectType(decl.type);

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueObject.valueTypeId);

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("a"), 1, "number");
                expectLiteralValue(valueMembers.get("b"), "2", "string");

                // TODO: change object value type behavior
                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe(LCETypeObject.typeId);
                checkObjectType(decl.initValue.type as LCETypeObject);
            }
        }
    });

    test("let x = [...];", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vArray'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vArray'));
            expect(decl.variableName).toBe("vArray");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, "Array", false);

            const typeArgs = (decl.type as LCETypeDeclared).typeArguments;
            expect(typeArgs).toHaveLength(1);
            expectPrimitiveType(typeArgs[0], "number");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueArray.valueTypeId);
                const arrayValue = decl.initValue as LCEValueArray;
                expect(arrayValue.items).toHaveLength(3);
                for (let i = 0; i < 3; i++) {
                    expectLiteralValue(arrayValue.items[i], i + 1, "number");
                }

                expectDeclaredType(decl.initValue.type, "Array", false);
                const valueTypeArgs = (decl.initValue.type as LCETypeDeclared).typeArguments;
                expect(valueTypeArgs).toHaveLength(1);
                expectPrimitiveType(valueTypeArgs[0], "number");
            }
        }
    });

    test("let x: [number, string] = [...];", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vTuple'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vTuple'));
            expect(decl.variableName).toBe("vTuple");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeTuple.typeId);
            const tupleTypes = (decl.type as LCETypeTuple).types;
            expect(tupleTypes).toHaveLength(2);
            expectPrimitiveType(tupleTypes[0], "number");
            expectPrimitiveType(tupleTypes[1], "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueArray.valueTypeId);
                const arrayValue = decl.initValue as LCEValueArray;
                expect(arrayValue.items).toHaveLength(2);
                expectLiteralValue(arrayValue.items[0], 1, "number");
                expectLiteralValue(arrayValue.items[1], "2", "string");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe(LCETypeTuple.typeId);
                const valueTupleTypes = (decl.initValue.type as LCETypeTuple).types;
                expect(valueTupleTypes).toHaveLength(2);
                expectPrimitiveType(valueTupleTypes[0], "number");
                expectPrimitiveType(valueTupleTypes[1], "string");
            }
        }
    });

    test("let x = function(...) {...}", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vFunction'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vFunction'));
            expect(decl.variableName).toBe("vFunction");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeFunction.typeId);

            function checkFunctionType(funcType: LCETypeFunction) {
                expectPrimitiveType(funcType.returnType, "string");

                const params = funcType.parameters;
                expect(params).toHaveLength(1);
                expectFunctionParameter(params, 0, "p1", false, "number");

                expect(funcType.typeParameters).toHaveLength(0);
            }
            checkFunctionType(decl.type as LCETypeFunction);

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueFunction.valueTypeId);
                expect((decl.initValue as LCEValueFunction).arrowFunction).toBe(false);
                checkFunctionType(decl.initValue.type as LCETypeFunction);
            }
        }
    });

    test("let x = (...) => {...}", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vArrowFunction'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vArrowFunction'));
            expect(decl.variableName).toBe("vArrowFunction");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeFunction.typeId);

            function checkFunctionType(funcType: LCETypeFunction) {
                expectPrimitiveType(funcType.returnType, "string");

                const params = funcType.parameters;
                expect(params).toHaveLength(1);
                expectFunctionParameter(params, 0, "p1", false, "number");

                expect(funcType.typeParameters).toHaveLength(0);
            }
            checkFunctionType(decl.type as LCETypeFunction);

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueFunction.valueTypeId);
                expect((decl.initValue as LCEValueFunction).arrowFunction).toBe(true);
                checkFunctionType(decl.initValue.type as LCETypeFunction);
            }
        }
    });

    test("let x = class {...}", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vClass'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vClass'));
            expect(decl.variableName).toBe("vClass");
            expect(decl.kind).toBe("let");

            // TODO: variable with assigned class value: undefined variable type behavior
            // expect(decl.type).toBeDefined();
            // expect(decl.type.type).toBe("primitive");
            // expect((decl.type as LCETypePrimitive).name).toBe("string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueClass.valueTypeId);

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe(LCETypeNotIdentified.typeId);
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe(LCETypeNotIdentified.CLASS_EXPRESSION.identifier);
            }
        }
    });

    test("let x: number | string = 1;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vUnion'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vUnion'));
            expect(decl.variableName).toBe("vUnion");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeUnion.typeId);
            const unionTypes = (decl.type as LCETypeUnion).types;

            expect(unionTypes).toHaveLength(2);
            expect(unionTypes[0].type).toBe(LCETypePrimitive.typeId);
            expect(unionTypes[1].type).toBe(LCETypePrimitive.typeId);
            unionTypes.sort((a, b) => (a as LCETypePrimitive).name.localeCompare((b as LCETypePrimitive).name));
            expect((unionTypes[0] as LCETypePrimitive).name).toBe("number");
            expect((unionTypes[1] as LCETypePrimitive).name).toBe("string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectLiteralValue(decl.initValue, 1, "number");
            }
        }
    });

    test("let x: {...} & {...} = {...};", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vIntersection'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vIntersection'));
            expect(decl.variableName).toBe("vIntersection");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe(LCETypeIntersection.typeId);
            const intersecTypes = (decl.type as LCETypeIntersection).types;

            expect(intersecTypes).toHaveLength(2);
            expect(intersecTypes[0].type).toBe(LCETypeObject.typeId);
            expect([...(intersecTypes[0] as LCETypeObject).members.entries()]).toHaveLength(1);
            expect(intersecTypes[1].type).toBe(LCETypeObject.typeId);
            expect([...(intersecTypes[1] as LCETypeObject).members]).toHaveLength(1);

            intersecTypes.sort((a, b) => (a as LCETypeObject).members[0].name.localeCompare((b as LCETypeObject).members[0].name));
            const aOType = expectObjectType(intersecTypes[0], 1);
            expectObjectTypeMember(aOType, "a", false, false, "number");
            const bOType = expectObjectType(intersecTypes[1], 1);
            expectObjectTypeMember(bOType, "b", false, false, "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueObject.valueTypeId);

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("a"), 1, "number");
                expectLiteralValue(valueMembers.get("b"), "a", "string");

                // TODO: decide how object value type should look like (currently: declared type)
                // checkObjectType(decl.initValue.type as LCETypeObject);
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe(???);
                // expect((decl.initValue.type as LCEType???).x).toBe("x");
            }
        }
    });

    test("let x = 1 + 2;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vComplex'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vComplex'));
            expect(decl.variableName).toBe("vComplex");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueComplex.valueTypeId);
                expect((decl.initValue as LCEValueComplex).expression).toBe("1 + 2");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe(LCETypeNotIdentified.typeId);
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe(LCETypeNotIdentified.COMPLEX_VALUE.identifier);
            }
        }
    });

    test("let x = y;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vRefDirect'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vRefDirect'));
            expect(decl.variableName).toBe("vRefDirect");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((decl.initValue as LCEValueDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vString'));

                expectPrimitiveType(decl.initValue.type, "string");
            }
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vRefDirect',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".vString'),
            1,
        );
    });

    test("let x = obj.a;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vRefMember'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vRefMember'));
            expect(decl.variableName).toBe("vRefMember");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectPrimitiveType(decl.initValue.type, "number");

                expect(decl.initValue.valueType).toBe("member");

                const parentValue = (decl.initValue as LCEValueMember).parent;
                expect(parentValue.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((parentValue as LCEValueDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vObject'));
                const oType = expectObjectType(parentValue.type, 2);
                expectObjectTypeMember(oType, "a", false, false, "number");
                expectObjectTypeMember(oType, "b", false, false, "string");

                const memberValue = (decl.initValue as LCEValueMember).member;
                expect(memberValue.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((memberValue as LCEValueDeclared).fqn.globalFqn).toBe("a");
                expectPrimitiveType(memberValue.type, "number");
            }
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vRefMember',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".vObject'),
            1,
        );
    });

    test("let x = fun(3);", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vRefCall'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vRefCall'));
            expect(decl.variableName).toBe("vRefCall");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueCall.valueTypeId);

                expectPrimitiveType(decl.initValue.type, "string");

                const callee = (decl.initValue as LCEValueCall).callee;
                expect(callee).toBeDefined();
                expect(callee.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((callee as LCEValueDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vFunction'));

                expect(callee.type).toBeDefined();
                expect(callee.type.type).toBe(LCETypeFunction.typeId);
                const funcType = callee.type as LCETypeFunction;
                expect(funcType.returnType.type).toBe(LCETypePrimitive.typeId);
                expect((funcType.returnType as LCETypePrimitive).name).toBe("string");

                const params = funcType.parameters;
                expect(params).toHaveLength(1);
                expectFunctionParameter(params, 0, "p1", false, "number");
                expect(funcType.typeParameters).toHaveLength(0);

                const args = (decl.initValue as LCEValueCall).args;
                expect(args).toBeDefined();
                expect(args).toHaveLength(1);
                expect(args[0].valueType).toBe(LCEValueLiteral.valueTypeId);
                expect((args[0] as LCEValueLiteral).value).toBe(3);
                expectPrimitiveType(args[0].type, "number");

                expect((decl.initValue as LCEValueCall).typeArgs).toHaveLength(0);
            }
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vRefCall',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".vFunction'),
            1,
        );
    });

    test("let x: Interface = {...};", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vInterfaceObj'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vInterfaceObj'));
            expect(decl.variableName).toBe("vInterfaceObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueObject.valueTypeId);

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vInterfaceObj',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
            1,
        );
    });

    test("let x = new Class();", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vClassObj'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vClassObj'));
            expect(decl.variableName).toBe("vClassObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueComplex.valueTypeId);
                expect((decl.initValue as LCEValueComplex).expression).toBe("new CustomClass(1, 2)");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe(LCETypeNotIdentified.typeId);
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe(LCETypeNotIdentified.COMPLEX_VALUE.identifier);
            }
        }

        // the cardinality is 2, because the class constructor is called during initialization
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vClassObj',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'),
            2,
        );
    });

    test("let x: TypeAlias = {...};", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vTypeObj'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vTypeObj'));
            expect(decl.variableName).toBe("vTypeObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueObject.valueTypeId);

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vTypeObj',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("let x: = Enum.MEMBER;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vEnum'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vEnum'));
            expect(decl.variableName).toBe("vEnum");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectDeclaredType(decl.initValue.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'));

                expect(decl.initValue.valueType).toBe(LCEValueMember.valueTypeId);

                const parentValue = (decl.initValue as LCEValueMember).parent;
                expect(parentValue.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((parentValue as LCEValueDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'));
                expect(parentValue.type.type).toBe(LCETypeNotIdentified.typeId);
                expect((parentValue.type as LCETypeNotIdentified).identifier).toBe("typeof CustomEnum");

                const memberValue = (decl.initValue as LCEValueMember).member;
                expect(memberValue.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((memberValue as LCEValueDeclared).fqn.globalFqn).toBe("A");

                expectDeclaredType(memberValue.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'));
            }
        }

        // the cardinality is 2, because the enum if referenced during initialization
        expectDependency(projectRootPath, dependencies, '"./src/main.ts".vEnum', resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomEnum'), 2);
    });

    test("let x: ExternalInterface = {...};", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtInterfaceObj'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtInterfaceObj'));
            expect(decl.variableName).toBe("vExtInterfaceObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueObject.valueTypeId);

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vExtInterfaceObj',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'),
            1,
        );
    });

    test("let x = new ExternalClass();", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtClassObj'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtClassObj'));
            expect(decl.variableName).toBe("vExtClassObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueComplex.valueTypeId);
                expect((decl.initValue as LCEValueComplex).expression).toBe("new ExternalCustomClass(1, 2)");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe(LCETypeNotIdentified.typeId);
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe(LCETypeNotIdentified.COMPLEX_VALUE.identifier);
            }
        }

        // the cardinality is 2, because the class constructor is called during initialization
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vExtClassObj',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'),
            2,
        );
    });

    test("let x: ExternalTypeAlias = {...};", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtTypeObj'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtTypeObj'));
            expect(decl.variableName).toBe("vExtTypeObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomType'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe(LCEValueObject.valueTypeId);

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vExtTypeObj',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomType'),
            1,
        );
    });

    test("let x: ExternalStringTypeAlias;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtStringTypeAlias'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtStringTypeAlias'));
            expect(decl.variableName).toBe("vExtStringTypeAlias");
            expect(decl.kind).toBe("let");

            // This behavior is caused by the TypeChecker that simplifies TypeAlias of primitive types
            expectPrimitiveType(decl.type, "string");

            expect(decl.initValue).toBeUndefined();
        }
    });

    // Local Enum values show correct behavior
    // NOTE: The fix would require manually changing the external FQN determined by the TS TypeChecker in type.utils.ts
    test("let x: = ExternalEnum.MEMBER;", async () => {
        const decl = varDecls.get(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtEnum'));
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".vExtEnum'));
            expect(decl.variableName).toBe("vExtEnum");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomEnum'));

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectDeclaredType(decl.initValue.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomEnum'));

                expect(decl.initValue.valueType).toBe(LCEValueMember.valueTypeId);

                const parentValue = (decl.initValue as LCEValueMember).parent;
                expect(parentValue.valueType).toBe("declared");
                expect((parentValue as LCEValueDeclared).fqn.globalFqn).toBe(
                    resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomEnum'),
                );
                // TODO: discrepancy between external and internal enum value parent type: typeof vs direct reference
                expectDeclaredType(parentValue.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomEnum'));

                const memberValue = (decl.initValue as LCEValueMember).member;
                expect(memberValue.valueType).toBe(LCEValueDeclared.valueTypeId);
                expect((memberValue as LCEValueDeclared).fqn.globalFqn).toBe("A");
                expectDeclaredType(memberValue.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomEnum'));
            }
        }

        // the cardinality is 2, because the enum if referenced during initialization
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".vExtEnum',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomEnum'),
            2,
        );
    });
});
