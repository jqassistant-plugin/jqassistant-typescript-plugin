import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
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
} from "../../utils/test-utils";

jest.setTimeout(30000);

describe("variable declarations test", () => {

    let result: Map<string, LCEConcept[]>;
    const varDecls: Map<string, LCEVariableDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/variable-declarations";
        result = await processProject(projectRoot);

        if(!result.get(LCEVariableDeclaration.conceptId)) {
            throw new Error("Could not find variable declarations in result data.")
        }

        for(const concept of (result.get(LCEVariableDeclaration.conceptId) ?? [])) {
            const varDecl: LCEVariableDeclaration = concept as LCEVariableDeclaration;
            if(!varDecl.fqn) {
                throw new Error("Variable declaration has no fqn " + JSON.stringify(varDecl));
            }
            if(varDecls.has(varDecl.fqn)) {
                throw new Error("Two variable declarations with same FQN were returned: " + varDecl.fqn);
            }
            varDecls.set(varDecl.fqn, varDecl);
        }
        
        const mainModuleConcept = result.get(LCEModule.conceptId)?.find(mod => (mod as LCEModule).fqn === "./src/main.ts");
        if(!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("var x;", async () => {
        const decl = varDecls.get('"./src/main.ts".vVarUninitialized');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vVarUninitialized");
            expect(decl.kind).toBe("var");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeUndefined();
        }
    });

    test("let x;", async () => {
        const decl = varDecls.get('"./src/main.ts".vLetUninitialized');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vLetUninitialized");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeUndefined();
        }
    });

    test("var x = 0;", async () => {
        const decl = varDecls.get('"./src/main.ts".vVarInit');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vVarInit");
            expect(decl.kind).toBe("var");

            expectPrimitiveType(decl.type, "number");
            expectLiteralValue(decl.initValue, 0, "number");
        }
    });

    test("let x = 0;", async () => {
        const decl = varDecls.get('"./src/main.ts".vLetInit');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vLetInit");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");
            expectLiteralValue(decl.initValue, 0, "number");
        }
    });

    test("const x = 0;", async () => {
        const decl = varDecls.get('"./src/main.ts".vConstInit');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vConstInit");
            expect(decl.kind).toBe("const");

            expectLiteralType(decl.type, 0);
            expectLiteralValue(decl.initValue, 0, "number");
        }
    });

    test("let x1 = 1, x2 = 2;", async () => {
        for(let i = 1; i <= 2; i++) {
            const decl = varDecls.get('"./src/main.ts".vMulti' + i);
            expect(decl).toBeDefined();
            if(decl) {
                expect(decl.coordinates.fileName).toBe(mainModule.path);
                expect(decl.variableName).toBe("vMulti" + i);
                expect(decl.kind).toBe("let");

                expectPrimitiveType(decl.type, "number");
                expectLiteralValue(decl.initValue, i, "number");
            }
        }
    });

    test("export let x = 5;", async () => {
        const decl = varDecls.get('"./src/main.ts".vExported');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vExported");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");
            expectLiteralValue(decl.initValue, 5, "number");
        }

        const exportDeclConcept = result.get(LCEExportDeclaration.conceptId)?.find(exp =>
            (exp as LCEExportDeclaration).declFqn === '"./src/main.ts".vExported');

        expect(exportDeclConcept).toBeDefined();
        if(exportDeclConcept) {
            const exportDecl = exportDeclConcept as LCEExportDeclaration;
            expect(exportDecl.kind).toBe("value");
            expect(exportDecl.identifier).toBe("vExported");
            expect(exportDecl.alias).toBeUndefined();
            expect(exportDecl.isDefault).toBe(false);
            expect(exportDecl.sourceFilePath).toBe(mainModule.fqn);
        }
    });

    test("let x = undefined;", async () => {
        const decl = varDecls.get('"./src/main.ts".vUndefined');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vUndefined");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("null")
                expect((decl.initValue as LCEValueNull).kind).toBe("undefined");
                expectPrimitiveType(decl.initValue.type, "undefined");
            }
        }
    });

    test("let x = null;", async () => {
        const decl = varDecls.get('"./src/main.ts".vNull');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vNull");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "any");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("null")
                expect((decl.initValue as LCEValueNull).kind).toBe("null");
                expectPrimitiveType(decl.initValue.type, "null");
            }
        }
    });

    test("let x = true;", async () => {
        const decl = varDecls.get('"./src/main.ts".vTrue');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vTrue");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "boolean");
            expectLiteralValue(decl.initValue, true, "boolean");
        }
    });

    test("let x = false;", async () => {
        const decl = varDecls.get('"./src/main.ts".vFalse');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vFalse");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "boolean");
            expectLiteralValue(decl.initValue, false, "boolean");
        }
    });

    test('let x = "1";', async () => {
        const decl = varDecls.get('"./src/main.ts".vString');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vString");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "string");
            expectLiteralValue(decl.initValue, "1", "string");
        }
    });

    test("let x = {...};", async () => {
        const decl = varDecls.get('"./src/main.ts".vObject');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vObject");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("object");

            function checkObjectType(type: LCEType) {
                const oType = expectObjectType(type, 2);
                expectObjectTypeMember(oType, "a", false, false, "number");
                expectObjectTypeMember(oType, "b", false, false, "string");
            }

            checkObjectType(decl.type);

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("object")

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("a"), 1, "number");
                expectLiteralValue(valueMembers.get("b"), "2", "string");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("object")
                // checkObjectType(decl.initValue.type as LCETypeObject);
            }
        }
    });

    test("let x = [...];", async () => {
        const decl = varDecls.get('"./src/main.ts".vArray');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vArray");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, "Array", false);

            const typeArgs = (decl.type as LCETypeDeclared).typeArguments;
            expect(typeArgs).toHaveLength(1);
            expectPrimitiveType(typeArgs[0], "number");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("array")
                const arrayValue = decl.initValue as LCEValueArray;
                expect(arrayValue.items).toHaveLength(3);
                for(let i = 0; i < 3; i++) {
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
        const decl = varDecls.get('"./src/main.ts".vTuple');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vTuple");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("tuple");
            const tupleTypes = (decl.type as LCETypeTuple).types;
            expect(tupleTypes).toHaveLength(2);
            expectPrimitiveType(tupleTypes[0], "number");
            expectPrimitiveType(tupleTypes[1], "string");


            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("array")
                const arrayValue = decl.initValue as LCEValueArray;
                expect(arrayValue.items).toHaveLength(2);
                expectLiteralValue(arrayValue.items[0], 1, "number");
                expectLiteralValue(arrayValue.items[1], "2", "string");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe("tuple");
                const valueTupleTypes = (decl.initValue.type as LCETypeTuple).types;
                expect(valueTupleTypes).toHaveLength(2);
                expectPrimitiveType(valueTupleTypes[0], "number");
                expectPrimitiveType(valueTupleTypes[1], "string");
            }
        }
    });

    test("let x = function(...) {...}", async () => {
        const decl = varDecls.get('"./src/main.ts".vFunction');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vFunction");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("function");

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
                expect(decl.initValue.valueType).toBe("function")
                expect((decl.initValue as LCEValueFunction).arrowFunction).toBe(false);
                checkFunctionType(decl.initValue.type as LCETypeFunction);
            }
        }
    });

    test("let x = (...) => {...}", async () => {
        const decl = varDecls.get('"./src/main.ts".vArrowFunction');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vArrowFunction");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("function");

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
                expect(decl.initValue.valueType).toBe("function")
                expect((decl.initValue as LCEValueFunction).arrowFunction).toBe(true);
                checkFunctionType(decl.initValue.type as LCETypeFunction);
            }
        }
    });

    test("let x = class {...}", async () => {
        const decl = varDecls.get('"./src/main.ts".vClass');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vClass");
            expect(decl.kind).toBe("let");

            // TODO: variable with assigned class value: undefined variable type behavior
            // expect(decl.type).toBeDefined();
            // expect(decl.type.type).toBe("primitive");
            // expect((decl.type as LCETypePrimitive).name).toBe("string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("class")

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe("not-identified");
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe("class expression");
            }
        }
    });

    test("let x: number | string = 1;", async () => {
        const decl = varDecls.get('"./src/main.ts".vUnion');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vUnion");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("union");
            const unionTypes = (decl.type as LCETypeUnion).types;

            expect(unionTypes).toHaveLength(2);
            expect(unionTypes[0].type).toBe("primitive");
            expect(unionTypes[1].type).toBe("primitive");
            unionTypes.sort((a, b) => (a as LCETypePrimitive).name.localeCompare((b as LCETypePrimitive).name))
            expect((unionTypes[0] as LCETypePrimitive).name).toBe("number");
            expect((unionTypes[1] as LCETypePrimitive).name).toBe("string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectLiteralValue(decl.initValue, 1, "number");
            }
        }
    });

    test("let x: {...} & {...} = {...};", async () => {
        const decl = varDecls.get('"./src/main.ts".vIntersection');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vIntersection");
            expect(decl.kind).toBe("let");

            expect(decl.type).toBeDefined();
            expect(decl.type.type).toBe("intersection");
            const intersecTypes = (decl.type as LCETypeIntersection).types;

            expect(intersecTypes).toHaveLength(2);
            expect(intersecTypes[0].type).toBe("object");
            expect([...(intersecTypes[0] as LCETypeObject).members.entries()]).toHaveLength(1);
            expect(intersecTypes[1].type).toBe("object");
            expect([...(intersecTypes[1] as LCETypeObject).members]).toHaveLength(1);

            intersecTypes.sort((a, b) => (a as LCETypeObject).members[0].name.localeCompare((b as LCETypeObject).members[0].name));
            const aOType = expectObjectType(intersecTypes[0], 1);
            expectObjectTypeMember(aOType, "a", false, false, "number");
            const bOType = expectObjectType(intersecTypes[1], 1);
            expectObjectTypeMember(bOType, "b", false, false, "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("object");

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
        const decl = varDecls.get('"./src/main.ts".vComplex');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vComplex");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("complex")
                expect((decl.initValue as LCEValueComplex).expression).toBe("1 + 2");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe("not-identified");
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe("complex");
            }
        }
    });

    test("let x = y;", async () => {
        const decl = varDecls.get('"./src/main.ts".vRefDirect');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vRefDirect");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("declared")
                expect((decl.initValue as LCEValueDeclared).fqn).toBe('"./src/main.ts".vString');

                expectPrimitiveType(decl.initValue.type, "string");
            }
        }

        expectDependency(dependencies, '"./src/main.ts".vRefDirect', '"./src/main.ts".vString', 1);
    });

    test("let x = obj.a;", async () => {
        const decl = varDecls.get('"./src/main.ts".vRefMember');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vRefMember");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "number");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe("primitive");
                expect((decl.initValue.type as LCETypePrimitive).name).toBe("number");

                expect(decl.initValue.valueType).toBe("member")
                
                const parentValue = (decl.initValue as LCEValueMember).parent;
                expect(parentValue.valueType).toBe("declared");
                expect((parentValue as LCEValueDeclared).fqn).toBe('"./src/main.ts".vObject');
                const oType = expectObjectType(parentValue.type, 2);
                expectObjectTypeMember(oType, "a", false, false, "number");
                expectObjectTypeMember(oType, "b", false, false, "string");

                const memberValue = (decl.initValue as LCEValueMember).member;
                expect(memberValue.valueType).toBe("declared");
                expect((memberValue as LCEValueDeclared).fqn).toBe("a");
                expectPrimitiveType(memberValue.type, "number");

            }
        }

        expectDependency(dependencies, '"./src/main.ts".vRefMember', '"./src/main.ts".vObject', 1);
    });

    test("let x = fun(3);", async () => {
        const decl = varDecls.get('"./src/main.ts".vRefCall');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vRefCall");
            expect(decl.kind).toBe("let");

            expectPrimitiveType(decl.type, "string");

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("call")

                expectPrimitiveType(decl.initValue.type, "string");

                const callee = (decl.initValue as LCEValueCall).callee;
                expect(callee).toBeDefined();
                expect(callee.valueType).toBe("declared");
                expect((callee as LCEValueDeclared).fqn).toBe('"./src/main.ts".vFunction')

                expect(callee.type).toBeDefined();
                expect(callee.type.type).toBe("function");
                const funcType = callee.type as LCETypeFunction;
                expect(funcType.returnType.type).toBe("primitive");
                expect((funcType.returnType as LCETypePrimitive).name).toBe("string");

                const params = funcType.parameters;
                expect(params).toHaveLength(1);
                expectFunctionParameter(params, 0, "p1", false, "number");
                expect(funcType.typeParameters).toHaveLength(0);

                const args = (decl.initValue as LCEValueCall).args;
                expect(args).toBeDefined();
                expect(args).toHaveLength(1);
                expect(args[0].valueType).toBe("literal");
                expect((args[0] as LCEValueLiteral).value).toBe(3);
                expectPrimitiveType(args[0].type, "number");

                expect((decl.initValue as LCEValueCall).typeArgs).toHaveLength(0);
            }
        }

        expectDependency(dependencies, '"./src/main.ts".vRefCall', '"./src/main.ts".vFunction', 1);
    });

    test("let x: Interface = {...};", async () => {
        const decl = varDecls.get('"./src/main.ts".vInterfaceObj');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vInterfaceObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/main.ts".CustomInterface');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("object")

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn).toBe('"./src/main.ts".CustomInterface');
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }

        expectDependency(dependencies, '"./src/main.ts".vInterfaceObj', '"./src/main.ts".CustomInterface', 1);
    });


    test("let x = new Class();", async () => {
        const decl = varDecls.get('"./src/main.ts".vClassObj');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vClassObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/main.ts".CustomClass');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("complex")
                expect((decl.initValue as LCEValueComplex).expression).toBe("new CustomClass(1, 2)");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe("not-identified");
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe("complex");
            }
        }

        // the cardinality is 2, because the class constructor is called during initialization
        expectDependency(dependencies, '"./src/main.ts".vClassObj', '"./src/main.ts".CustomClass', 2);
    });

    test("let x: TypeAlias = {...};", async () => {
        const decl = varDecls.get('"./src/main.ts".vTypeObj');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vTypeObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/main.ts".CustomType');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("object")

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn).toBe('"./src/main.ts".CustomInterface');
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }
        expectDependency(dependencies, '"./src/main.ts".vTypeObj', '"./src/main.ts".CustomType', 1);
    });

    test("let x: = Enum.MEMBER;", async () => {
        const decl = varDecls.get('"./src/main.ts".vEnum');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vEnum");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/main.ts".CustomEnum');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectDeclaredType(decl.initValue.type, '"./src/main.ts".CustomEnum');

                expect(decl.initValue.valueType).toBe("member")
                
                const parentValue = (decl.initValue as LCEValueMember).parent;
                expect(parentValue.valueType).toBe("declared");
                expect((parentValue as LCEValueDeclared).fqn).toBe('"./src/main.ts".CustomEnum');
                expect(parentValue.type.type).toBe("not-identified");
                expect((parentValue.type as LCETypeNotIdentified).identifier).toBe("typeof CustomEnum");

                const memberValue = (decl.initValue as LCEValueMember).member;
                expect(memberValue.valueType).toBe("declared");
                expect((memberValue as LCEValueDeclared).fqn).toBe('A');
                expectDeclaredType(memberValue.type, '"./src/main.ts".CustomEnum');
            }
        }

        // the cardinality is 2, because the enum if referenced during initialization
        expectDependency(dependencies, '"./src/main.ts".vEnum', '"./src/main.ts".CustomEnum', 2);
    });

    test("let x: ExternalInterface = {...};", async () => {
        const decl = varDecls.get('"./src/main.ts".vExtInterfaceObj');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vExtInterfaceObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/secondary.ts".ExternalCustomInterface');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("object")

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn).toBe('"./src/main.ts".CustomInterface');
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }

        expectDependency(dependencies, '"./src/main.ts".vExtInterfaceObj', '"./src/secondary.ts".ExternalCustomInterface', 1);
    });


    test("let x = new ExternalClass();", async () => {
        const decl = varDecls.get('"./src/main.ts".vExtClassObj');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vExtClassObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/secondary.ts".ExternalCustomClass');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("complex")
                expect((decl.initValue as LCEValueComplex).expression).toBe("new ExternalCustomClass(1, 2)");

                expect(decl.initValue.type).toBeDefined();
                expect(decl.initValue.type.type).toBe("not-identified");
                expect((decl.initValue.type as LCETypeNotIdentified).identifier).toBe("complex");
            }
        }

        // the cardinality is 2, because the class constructor is called during initialization
        expectDependency(dependencies, '"./src/main.ts".vExtClassObj', '"./src/secondary.ts".ExternalCustomClass', 2);
    });

    test("let x: ExternalTypeAlias = {...};", async () => {
        const decl = varDecls.get('"./src/main.ts".vExtTypeObj');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vExtTypeObj");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/secondary.ts".ExternalCustomType');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expect(decl.initValue.valueType).toBe("object")

                const valueMembers = (decl.initValue as LCEValueObject).members;
                expectLiteralValue(valueMembers.get("x"), 1, "number");
                expectLiteralValue(valueMembers.get("y"), 2, "number");

                // TODO: change object value type behavior
                // expect(decl.initValue.type).toBeDefined();
                // expect(decl.initValue.type.type).toBe("declared");
                // expect((decl.initValue.type as LCETypeDeclared).fqn).toBe('"./src/main.ts".CustomInterface');
                // expect((decl.initValue.type as LCETypeDeclared).typeArguments).toHaveLength(0);
            }
        }

        expectDependency(dependencies, '"./src/main.ts".vExtTypeObj', '"./src/secondary.ts".ExternalCustomType', 1);
    });

    // TODO: fix different handling of local and remote enum values and their types
    test.skip("let x: = ExternalEnum.MEMBER;", async () => {
        const decl = varDecls.get('"./src/main.ts".vExtEnum');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.variableName).toBe("vExtEnum");
            expect(decl.kind).toBe("let");

            expectDeclaredType(decl.type, '"./src/secondary.ts".ExternalCustomEnum');

            expect(decl.initValue).toBeDefined();
            if (decl.initValue) {
                expectDeclaredType(decl.initValue.type, '"./src/secondary.ts".ExternalCustomEnum');

                expect(decl.initValue.valueType).toBe("member")

                const parentValue = (decl.initValue as LCEValueMember).parent;
                expect(parentValue.valueType).toBe("declared");
                expect((parentValue as LCEValueDeclared).fqn).toBe('"./src/secondary.ts".ExternalCustomEnum');
                expect(parentValue.type.type).toBe("not-identified");
                expect((parentValue.type as LCETypeNotIdentified).identifier).toBe("typeof ExternalCustomEnum");

                const memberValue = (decl.initValue as LCEValueMember).member;
                expect(memberValue.valueType).toBe("declared");
                expect((memberValue as LCEValueDeclared).fqn).toBe('A');
                expectDeclaredType(memberValue.type, '"./src/secondary.ts".ExternalCustomEnum');
            }
        }

        // the cardinality is 2, because the enum if referenced during initialization
        expectDependency(dependencies, '"./src/main.ts".vExtEnum', '"./src/secondary.ts".ExternalCustomEnum', 2);
    });

});
