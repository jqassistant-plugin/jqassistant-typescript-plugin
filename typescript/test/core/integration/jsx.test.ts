import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";
import { expectDeclaredType, expectDependency, getDependenciesFromResult, initNodeSampleProject } from "../../utils/test-utils";
import { LCEFunctionDeclaration } from "../../../src/core/concepts/function-declaration.concept";
import { LCEModule } from "../../../src/core/concepts/typescript-module.concept";

jest.setTimeout(30000);

describe("JSX test", () => {
    let result: Map<string, LCEConcept[]>;
    let deps: Map<string, Map<string, LCEDependency>>;
    const funDecls: Map<string, LCEFunctionDeclaration> = new Map();
    let mainModule: LCEModule;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-projects/jsx";
        initNodeSampleProject(projectRoot);
        result = await processProject(projectRoot);
        deps = getDependenciesFromResult(result);

        if(!result.get(LCEFunctionDeclaration.conceptId)) {
            throw new Error("Could not find function declarations in result data.")
        }

        for(const concept of (result.get(LCEFunctionDeclaration.conceptId) ?? [])) {
            const funDecl: LCEFunctionDeclaration = concept as LCEFunctionDeclaration;
            if(!funDecl.fqn) {
                throw new Error("Function declaration has no fqn " + JSON.stringify(funDecl));
            }
            if(funDecls.has(funDecl.fqn)) {
                throw new Error("Two function declarations with same FQN were returned: " + funDecl.fqn);
            }
            funDecls.set(funDecl.fqn, funDecl);
        }

        const mainModuleConcept = result.get(LCEModule.conceptId)?.find(mod => (mod as LCEModule).fqn === "./src/main.tsx");
        if(!mainModuleConcept) {
            throw new Error("Could not find main module in result data");
        }
        mainModule = mainModuleConcept as LCEModule;
    });

    test("plain JSX return", async () => {
        const decl = funDecls.get('"./src/main.tsx".returnJSX');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("returnJSX");

            expectDeclaredType(decl.returnType, '"react".React.JSX.Element');

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }
    });

    test("JSX with local reference", async () => {
        const decl = funDecls.get('"./src/main.tsx".localRef');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("localRef");

            expectDeclaredType(decl.returnType, '"react".React.JSX.Element');

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(deps, '"./src/main.tsx".localRef', '"./src/main.tsx".LOCAL', 1);
    });

    test("JSX with remote reference", async () => {
        const decl = funDecls.get('"./src/main.tsx".remoteRef');
        expect(decl).toBeDefined();
        if(decl) {
            expect(decl.coordinates.fileName).toBe(mainModule.path);
            expect(decl.functionName).toBe("remoteRef");

            expectDeclaredType(decl.returnType, '"react".React.JSX.Element');

            expect(decl.parameters).toHaveLength(0);

            expect(decl.async).toBe(false);

            expect(decl.typeParameters).toHaveLength(0);
        }

        expectDependency(deps, '"./src/main.tsx".remoteRef', '"./src/secondary.tsx".REMOTE', 1);
    });

});
