import { processProjects } from "../../../src/core/extractor";
import { expectDependency, getDependenciesFromResult, initNodeSampleProject, resolveGlobalFqn } from "../../utils/test-utils";
import { initializeReactExtractor } from "../../../src/react/react-extractor";
import { LCEReactComponent } from "../../../src/react/concepts/react-component.concept";
import { expectJSXDependency } from "../../utils/react-test-utils";
import { LCEDependency } from "../../../src/core/concepts/dependency.concept";

jest.setTimeout(30000);

describe("React Components test", () => {
    const projectRootPath = "./test/react/integration/sample-projects/components";
    let result: Map<string, object[]>;
    const components: Map<string, LCEReactComponent> = new Map();
    let dependencies: Map<string, Map<string, LCEDependency>>;

    beforeAll(async () => {
        initNodeSampleProject(projectRootPath);
        initializeReactExtractor();
        const projects = await processProjects(projectRootPath);
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }
        result = projects[0].concepts;

        if (!result.get(LCEReactComponent.conceptId)) {
            throw new Error("Could not find React components in result data.");
        }

        for (const concept of result.get(LCEReactComponent.conceptId) ?? []) {
            const component: LCEReactComponent = concept as LCEReactComponent;
            if (!component.fqn.globalFqn) {
                throw new Error("React component has no globalFQN " + JSON.stringify(component));
            }
            if (components.has(component.fqn.globalFqn)) {
                throw new Error("Two React components with same global FQN were returned: " + component.fqn.globalFqn);
            }
            components.set(component.fqn.globalFqn, component);
        }

        dependencies = getDependenciesFromResult(result);
    });

    test("basic function component", async () => {
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".BasicFunctionComponent'));
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("BasicFunctionComponent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".BasicFunctionComponent'));
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("basic arrow function component", async () => {
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".BasicArrowFunctionComponent'));
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("BasicArrowFunctionComponent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".BasicArrowFunctionComponent'));
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("basic class component", async () => {
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".BasicClassComponent'));
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("BasicClassComponent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".BasicClassComponent'));
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("arrow function component with content", async () => {
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ArrFuncComponentWithContent'));
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("ArrFuncComponentWithContent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ArrFuncComponentWithContent'));
            expect(comp.renderedElements).toHaveLength(3);
            expectJSXDependency(comp, "h1", "h1", 1);
            expectJSXDependency(comp, "h2", "h2", 2);
            expectJSXDependency(comp, resolveGlobalFqn(projectRootPath, '"./src/main.tsx".SomeComponent'), "SomeComponent", 1);
        }
    });

    test("arrow function component with React.FC type", async () => {
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ArrFuncComponentReactFC'));
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("ArrFuncComponentReactFC");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ArrFuncComponentReactFC'));
            expect(comp.renderedElements).toHaveLength(0);
        }
    });

    test("class component with content", async () => {
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ClassComponentWithContent'));
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("ClassComponentWithContent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ClassComponentWithContent'));
            expect(comp.renderedElements).toHaveLength(3);
            expectJSXDependency(comp, "h1", "h1", 1);
            expectJSXDependency(comp, "div", "div", 1);
            expectJSXDependency(comp, resolveGlobalFqn(projectRootPath, '"./src/main.tsx".SomeComponent'), "SomeComponent", 3);
        }
    });

    test("component containing an unnamed default exported component using a index source file", async () => {
        const compDef = components.get(resolveGlobalFqn(projectRootPath, '"./src/components/UnnamedIndexComponent".default'));
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ComponentWithUnnamedIndexDefaultComponent'));

        expect(compDef).toBeDefined();
        if (compDef) {
            expect(compDef.componentName).toBe("UnnamedIndexComponent");
            expect(compDef.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/components/UnnamedIndexComponent".default'));
            expect(compDef.renderedElements).toHaveLength(1);
            expectJSXDependency(compDef, "div", "div", 1);
        }
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("ComponentWithUnnamedIndexDefaultComponent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ComponentWithUnnamedIndexDefaultComponent'));
            expect(comp.renderedElements).toHaveLength(1);
            expectJSXDependency(
                comp,
                resolveGlobalFqn(projectRootPath, '"./src/components/UnnamedIndexComponent".default'),
                "UnnamedIndexComponent",
                1,
            );
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.tsx".ComponentWithUnnamedIndexDefaultComponent',
                resolveGlobalFqn(projectRootPath, '"./src/components/UnnamedIndexComponent".default'),
                1,
            );
        }
    });

    test("component containing a named default exported component using a index source file", async () => {
        const compDef = components.get(resolveGlobalFqn(projectRootPath, '"./src/components/NamedIndexComponent".default'));
        const comp = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ComponentWithNamedIndexDefaultComponent'));
        const compAlias = components.get(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ComponentWithNamedAliasIndexDefaultComponent'));

        expect(compDef).toBeDefined();
        if (compDef) {
            expect(compDef.componentName).toBe("MyNamedIndexComponent");
            expect(compDef.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/components/NamedIndexComponent".default'));
            expect(compDef.renderedElements).toHaveLength(1);
            expectJSXDependency(compDef, "div", "div", 1);
        }
        expect(comp).toBeDefined();
        if (comp) {
            expect(comp.componentName).toBe("ComponentWithNamedIndexDefaultComponent");
            expect(comp.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ComponentWithNamedIndexDefaultComponent'));
            expect(comp.renderedElements).toHaveLength(1);
            expectJSXDependency(comp, resolveGlobalFqn(projectRootPath, '"./src/components/NamedIndexComponent".default'), "NamedIndexComponent", 1);
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.tsx".ComponentWithNamedIndexDefaultComponent',
                resolveGlobalFqn(projectRootPath, '"./src/components/NamedIndexComponent".default'),
                1,
            );
        }
        expect(compAlias).toBeDefined();
        if (compAlias) {
            expect(compAlias.componentName).toBe("ComponentWithNamedAliasIndexDefaultComponent");
            expect(compAlias.fqn.globalFqn).toBe(resolveGlobalFqn(projectRootPath, '"./src/main.tsx".ComponentWithNamedAliasIndexDefaultComponent'));
            expect(compAlias.renderedElements).toHaveLength(1);
            expectJSXDependency(
                compAlias,
                resolveGlobalFqn(projectRootPath, '"./src/components/NamedIndexComponent".default'),
                "MyNamedIndexComponent",
                1,
            );
            expectDependency(
                projectRootPath,
                dependencies,
                '"./src/main.tsx".ComponentWithNamedAliasIndexDefaultComponent',
                resolveGlobalFqn(projectRootPath, '"./src/components/NamedIndexComponent".default'),
                1,
            );
        }
    });
});
