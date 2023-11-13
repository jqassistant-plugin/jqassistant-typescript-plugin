import { processProject } from "../../../src/core/extractor";
import { LCEConcept } from "../../../src/core/concept";
import { initNodeSampleProject } from "../../utils/test-utils";
import { LCEFunctionDeclaration } from "../../../src/core/concepts/function-declaration.concept";
import { initializeReactExtractor } from "../../../src/react/react-extractor";
import { LCEReactComponent } from "../../../src/react/concepts/react-component.concept";

jest.setTimeout(30000);

describe("React Components test", () => {
    let result: Map<string, LCEConcept[]>;
    const components: Map<string, LCEReactComponent> = new Map();

    beforeAll(async () => {
        const projectRoot = "./test/react/integration/sample-projects/components";
        initNodeSampleProject(projectRoot);
        initializeReactExtractor();
        result = await processProject(projectRoot);

        if(!result.get(LCEFunctionDeclaration.conceptId)) {
            throw new Error("Could not find React components in result data.")
        }

        for(const concept of (result.get(LCEReactComponent.conceptId) ?? [])) {
            const component: LCEReactComponent = concept as LCEReactComponent;
            if(!component.fqn) {
                throw new Error("React component has no fqn " + JSON.stringify(component));
            }
            if(components.has(component.fqn)) {
                throw new Error("Two React components with same FQN were returned: " + component.fqn);
            }
            components.set(component.fqn, component);
        }
    });

    test("basic function component", async () => {
        const comp = components.get('"./src/main.tsx".BasicFunctionComponent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("BasicFunctionComponent");
            expect(comp.fqn).toBe('"./src/main.tsx".BasicFunctionComponent');
            expect(comp.classComponent).toBeFalsy();
        }
    });

    test("basic arrow function component", async () => {
        const comp = components.get('"./src/main.tsx".BasicArrowFunctionComponent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("BasicArrowFunctionComponent");
            expect(comp.fqn).toBe('"./src/main.tsx".BasicArrowFunctionComponent');
            expect(comp.classComponent).toBeFalsy();
        }
    });

    test("basic class component", async () => {
        const comp = components.get('"./src/main.tsx".BasicClassComponent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("BasicClassComponent");
            expect(comp.fqn).toBe('"./src/main.tsx".BasicClassComponent');
            expect(comp.classComponent).toBeTruthy();
        }
    });

});
