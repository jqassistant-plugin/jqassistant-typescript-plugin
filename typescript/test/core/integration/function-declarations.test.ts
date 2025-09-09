import { processProjects } from "../../../src/core/extractor";
import { LCETypePrimitive, LCETypeUnion } from "../../../src/core/concepts/type.concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import {
    expectDeclaredType,
    expectDependency,
    expectFunctionParameter,
    expectObjectType,
    expectObjectTypeMember,
    expectPrimitiveType,
    expectTypeParameterDeclaration,
    expectTypeParameterReference,
    getDependenciesFromResult,
    resolveGlobalFqn,
} from "../../utils/test-utils";
import { LCEFunctionDeclaration } from "../../../src/core/concepts/function-declaration.concept";
import { LCEExportDeclaration } from "../../../src/core/concepts/export-declaration.concept";

jest.setTimeout(30000);

describe("function declarations test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/function-declarations";
    let result: Map<string, object[]>;
    const funDecls: Map<string, LCEFunctionDeclaration> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;
    let mainModule: LCEModule;
    let indexModule: LCEModule;

    beforeAll(async () => {
        const projects = await processProjects(projectRootPath);
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }
        result = projects[0].concepts;

        if (!result.get(LCEFunctionDeclaration.conceptId)) {
            throw new Error("Could not find function declarations in result data.");
        }

        for (const concept of result.get(LCEFunctionDeclaration.conceptId) ?? []) {
            const funDecl: LCEFunctionDeclaration = concept as LCEFunctionDeclaration;
            if (!funDecl.fqn.localFqn) {
                throw new Error("Function declaration has no local FQN " + JSON.stringify(funDecl));
            }
            if (funDecls.has(funDecl.fqn.localFqn)) {
                throw new Error("Two function declarations with same local FQN were returned: " + funDecl.fqn.localFqn);
            }
            funDecls.set(funDecl.fqn.localFqn, funDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/main.ts");
        if (!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;

        const indexModuleConcept = result.get(LCEModule.conceptId)?.find((mod) => (mod as LCEModule).fqn.localFqn === "./src/MyComponent/index.ts");
        if (!indexModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        indexModule = indexModuleConcept as LCEModule;

        dependencies = getDependenciesFromResult(result);
    });

    test("empty function", async () => {
        const decl = funDecls.get('"./src/main.ts".fEmpty');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fEmpty'));
            expect(decl.functionName).toBe("fEmpty");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("simple function that returns number", async () => {
        const decl = funDecls.get('"./src/main.ts".fReturn');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fReturn'));
            expect(decl.functionName).toBe("fReturn");

            expectPrimitiveType(decl.returnType, "number");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("simple function that returns interface instance", async () => {
        const decl = funDecls.get('"./src/main.ts".fReturnRef');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fReturnRef'));
            expect(decl.functionName).toBe("fReturnRef");

            expectDeclaredType(decl.returnType, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fReturnRef',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
            1,
        );
    });

    test("simple function that returns interface instance of different module", async () => {
        const decl = funDecls.get('"./src/main.ts".fReturnRefExt');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fReturnRefExt'));
            expect(decl.functionName).toBe("fReturnRefExt");

            expectDeclaredType(decl.returnType, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fReturnRefExt',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'),
            1,
        );
    });

    test("exported empty function", async () => {
        const decl = funDecls.get('"./src/main.ts".fExported');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fExported'));
            expect(decl.functionName).toBe("fExported");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);

            const exportDeclConcept = result
                .get(LCEExportDeclaration.conceptId)
                ?.find((exp) => (exp as LCEExportDeclaration).globalDeclFqn === resolveGlobalFqn(projectRootPath, '"./src/main.ts".fExported'));

            expect(exportDeclConcept).toBeDefined();
            if (exportDeclConcept) {
                const exportDecl = exportDeclConcept as LCEExportDeclaration;
                expect(exportDecl.kind).toBe("value");
                expect(exportDecl.identifier).toBe("fExported");
                expect(exportDecl.alias).toBeUndefined();
                expect(exportDecl.isDefault).toBe(false);
                expect(exportDecl.sourceFilePathAbsolute).toBe(mainModule.fqn.globalFqn);
            }
        }
    });

    test("function with dependencies in body", async () => {
        const decl = funDecls.get('"./src/main.ts".fBodyRef');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fBodyRef'));
            expect(decl.functionName).toBe("fBodyRef");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(projectRootPath, dependencies, '"./src/main.ts".fBodyRef', resolveGlobalFqn(projectRootPath, '"./src/main.ts".fEmpty'), 1);
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fBodyRef',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'),
            1,
        );
    });

    test("function with single parameter", async () => {
        const decl = funDecls.get('"./src/main.ts".fParam');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fParam'));
            expect(decl.functionName).toBe("fParam");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false, "number");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("function with multiple parameters", async () => {
        const decl = funDecls.get('"./src/main.ts".fMultiParam');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fMultiParam'));
            expect(decl.functionName).toBe("fMultiParam");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(3);
            expectFunctionParameter(decl.parameters, 0, "p1", false, "number");
            expectFunctionParameter(decl.parameters, 1, "p2", false, "string");
            expectFunctionParameter(decl.parameters, 2, "p3", true);

            expect(decl.parameters[2].type).toBeDefined();
            expect(decl.parameters[2].type.type).toBe(LCETypeUnion.typeId);
            const unionTypes = (decl.parameters[2].type as LCETypeUnion).types;

            expect(unionTypes).toHaveLength(2);
            expect(unionTypes[0].type).toBe(LCETypePrimitive.typeId);
            expect(unionTypes[1].type).toBe(LCETypePrimitive.typeId);
            unionTypes.sort((a, b) => (a as LCETypePrimitive).name.localeCompare((b as LCETypePrimitive).name));
            expect((unionTypes[0] as LCETypePrimitive).name).toBe("string");
            expect((unionTypes[1] as LCETypePrimitive).name).toBe("undefined");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("function with single destructured parameter of referenced interface type", async () => {
        const decl = funDecls.get('"./src/main.ts".fDestructuredParam');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fDestructuredParam'));
            expect(decl.functionName).toBe("fDestructuredParam");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "", false);
            expectDeclaredType(decl.parameters[0].type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fDestructuredParam',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
            1,
        );
    });

    test("function with single parameter of referenced class type", async () => {
        const decl = funDecls.get('"./src/main.ts".fParamRef');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fParamRef'));
            expect(decl.functionName).toBe("fParamRef");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectDeclaredType(decl.parameters[0]!.type, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'));

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fParamRef',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomClass'),
            1,
        );
    });

    test("function with single parameter of referenced class type of different module", async () => {
        const decl = funDecls.get('"./src/main.ts".fParamRefExt');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fParamRefExt'));
            expect(decl.functionName).toBe("fParamRefExt");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectDeclaredType(decl.parameters[0]!.type, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'));

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fParamRefExt',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomClass'),
            1,
        );
    });

    test("generic function with single type parameter", async () => {
        const decl = funDecls.get('"./src/main.ts".fGeneric');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGeneric'));
            expect(decl.functionName).toBe("fGeneric");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T");
        }
    });

    test("generic function with multiple type parameters", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericMulti');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGenericMulti'));
            expect(decl.functionName).toBe("fGenericMulti");

            expectTypeParameterReference(decl.returnType, "U");

            expect(decl.parameters).toHaveLength(2);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectFunctionParameter(decl.parameters, 1, "p2", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");
            expectTypeParameterReference(decl.parameters[1]!.type, "U");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(2);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T");
            expectTypeParameterDeclaration(decl.typeParameters, 1, "U");
        }
    });

    test("generic function with constrained type parameter", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericConstraint');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGenericConstraint'));
            expect(decl.functionName).toBe("fGenericConstraint");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T", false);
            expect(decl.typeParameters[0].constraint).toBeDefined();
            const constraint = expectObjectType(decl.typeParameters[0].constraint, 1);
            expectObjectTypeMember(constraint, "x", false, false, "number");
        }
    });

    test("generic function with type parameter constrained by type declaration", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericConstraintRef');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGenericConstraintRef'));
            expect(decl.functionName).toBe("fGenericConstraintRef");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T", false);
            expectDeclaredType(decl.typeParameters[0].constraint, resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fGenericConstraintRef',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomInterface'),
            1,
        );
    });

    test("generic function with type parameter constrained by type declaration of different module", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericConstraintRefExt');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGenericConstraintRefExt'));
            expect(decl.functionName).toBe("fGenericConstraintRefExt");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "p1", false);
            expectTypeParameterReference(decl.parameters[0]!.type, "T");

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(1);
            expectTypeParameterDeclaration(decl.typeParameters, 0, "T", false);
            expectDeclaredType(decl.typeParameters[0].constraint, resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'));
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fGenericConstraintRefExt',
            resolveGlobalFqn(projectRootPath, '"./src/secondary.ts".ExternalCustomInterface'),
            1,
        );
    });

    test("nested function", async () => {
        const decl = funDecls.get('"./src/main.ts".fNested');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fNested'));
            expect(decl.functionName).toBe("fNested");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("async function", async () => {
        const decl = funDecls.get('"./src/main.ts".fAsync');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fAsync'));
            expect(decl.functionName).toBe("fAsync");

            const returnType = expectDeclaredType(decl.returnType, "Promise", false);
            expect(returnType.typeArguments).toHaveLength(1);
            expectPrimitiveType(returnType.typeArguments[0], "number");

            expect(decl.parameters).toHaveLength(2);
            expectFunctionParameter(decl.parameters, 0, "p1", false, "string");
            expectFunctionParameter(decl.parameters, 1, "p2", false, "number");

            expect(decl.async).toBe(true);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("function with call to generic function", async () => {
        const decl = funDecls.get('"./src/main.ts".fGenericDependency');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGenericDependency'));
            expect(decl.functionName).toBe("fGenericDependency");

            expectPrimitiveType(decl.returnType, "void");

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fGenericDependency',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".fGenericConstraint'),
            1,
        );
        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/main.ts".fGenericDependency',
            resolveGlobalFqn(projectRootPath, '"./src/main.ts".CustomType'),
            1,
        );
    });

    test("function within index.ts with single parameter of referenced class type", async () => {
        const decl = funDecls.get('"./src/MyComponent".MyComponent');
        expect(decl).toBeDefined();
        if (decl) {
            expect(decl.coordinates.fileName).toBe(indexModule.path);
            expect(decl.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/MyComponent".MyComponent'));
            expect(decl.functionName).toBe("MyComponent");

            expectPrimitiveType(decl.returnType, "number");

            expect(decl.parameters).toHaveLength(1);
            expectFunctionParameter(decl.parameters, 0, "props", false);
            expectDeclaredType(decl.parameters[0]!.type, resolveGlobalFqn(projectRootPath, '"./src/MyComponent".MyComponentPropType'));

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(
            projectRootPath,
            dependencies,
            '"./src/MyComponent".MyComponent',
            resolveGlobalFqn(projectRootPath, '"./src/MyComponent".MyComponentPropType'),
            1,
        );
    });
});
