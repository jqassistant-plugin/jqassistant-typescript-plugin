import { LCEReactComponent } from "../../src/react/concepts/react-component.concept";
import { LCEJSXDependency } from "../../src/react/concepts/react-jsx-dependency";


/**
 * Expects a React component to use a certain element.
 */
export function expectJSXDependency(component: LCEReactComponent, fqn: string, name: string, cardinality: number): LCEJSXDependency {
    let depOpt = component.renderedElements.find(elem => elem.fqn === fqn);
    expect(depOpt).toBeDefined();
    const dep = depOpt! as LCEJSXDependency;
    expect(dep.name).toBe(name);
    expect(dep.cardinality).toBe(cardinality);
    return depOpt!;
}
