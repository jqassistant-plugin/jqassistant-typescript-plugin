import { processProject } from "../../../src/core/extractor";
import { initNodeSampleProject } from "../../utils/test-utils";
import { initializeReactExtractor } from "../../../src/react/react-extractor";
import { LCEReactComponent } from "../../../src/react/concepts/react-component.concept";
import { expectJSXDependency } from "../../utils/react-test-utils";

jest.setTimeout(30000);

describe("React Components test", () => {
    let result: Map<string, object[]>;
    const components: Map<string, LCEReactComponent> = new Map();

    beforeAll(async () => {
        const projectRoot = "./test/react/integration/sample-projects/components";
        initNodeSampleProject(projectRoot);
        initializeReactExtractor();
        result = await processProject(projectRoot);

        if(!result.get(LCEReactComponent.conceptId)) {
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
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("basic arrow function component", async () => {
        const comp = components.get('"./src/main.tsx".BasicArrowFunctionComponent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("BasicArrowFunctionComponent");
            expect(comp.fqn).toBe('"./src/main.tsx".BasicArrowFunctionComponent');
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("basic class component", async () => {
        const comp = components.get('"./src/main.tsx".BasicClassComponent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("BasicClassComponent");
            expect(comp.fqn).toBe('"./src/main.tsx".BasicClassComponent');
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("arrow function component with content", async () => {
        const comp = components.get('"./src/main.tsx".ArrFuncComponentWithContent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("ArrFuncComponentWithContent");
            expect(comp.fqn).toBe('"./src/main.tsx".ArrFuncComponentWithContent');
            expect(comp.renderedElements).toHaveLength(3);
            expectJSXDependency(comp, 'h1', 'h1', 1);
            expectJSXDependency(comp, 'h2', 'h2', 2);
            expectJSXDependency(comp, '"./src/main.tsx".SomeComponent', 'SomeComponent', 1);

        }
    });

    test("class function component with content", async () => {
        const comp = components.get('"./src/main.tsx".ClassComponentWithContent');
        expect(comp).toBeDefined();
        if(comp) {
            expect(comp.componentName).toBe("ClassComponentWithContent");
            expect(comp.fqn).toBe('"./src/main.tsx".ClassComponentWithContent');
            expect(comp.renderedElements).toHaveLength(3);
            expectJSXDependency(comp, 'h1', 'h1', 1);
            expectJSXDependency(comp, 'div', 'div', 1);
            expectJSXDependency(comp, '"./src/main.tsx".SomeComponent', 'SomeComponent', 3);
        }
    });

});
