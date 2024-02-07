import { LCEReactComponent } from "../../src/react/concepts/react-component.concept";
import { LCEJSXDependency } from "../../src/react/concepts/react-jsx-dependency";


/**
 * Expects a React component to use a certain element.
 */
export function expectJSXDependency(component: LCEReactComponent, globalFqn: string, name: string, cardinality: number): LCEJSXDependency {
    let depOpt = component.renderedElements.find(elem => elem.fqn.globalFqn === globalFqn);
    expect(depOpt).toBeDefined();
    const dep = depOpt! as LCEJSXDependency;
    expect(dep.name).toBe(name);
    expect(dep.cardinality).toBe(cardinality);
    return depOpt!;
}
