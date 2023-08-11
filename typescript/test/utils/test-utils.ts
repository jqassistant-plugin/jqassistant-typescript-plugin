import {LCEDependency} from "../../src/core/concepts/dependency.concept";
import {LCEConcept} from "../../src/core/concept";

export function getDependenciesFromResult(result: Map<string, LCEConcept[]>): Map<string, Map<string, LCEDependency>> {
    const dependencies: Map<string, Map<string, LCEDependency>>  = new Map();
    for(const concept of (result.get(LCEDependency.conceptId) ?? [])) {
        const dep: LCEDependency = concept as LCEDependency;
        if(!dep.sourceFQN) {
            throw new Error("Dependency has no source fqn " + JSON.stringify(dep));
        }
        if(!dep.fqn) {
            throw new Error("Dependency has no target fqn " + JSON.stringify(dep));
        }
        if(dependencies.get(dep.sourceFQN)?.get(dep.fqn)) {
            throw new Error("Two dependencies with same source and target FQN were returned: " + JSON.stringify(dep));
        }

        if(!dependencies.has(dep.sourceFQN)) {
            dependencies.set(dep.sourceFQN, new Map());
        }
        dependencies.get(dep.sourceFQN)?.set(dep.fqn, dep);
    }

    return dependencies;
}

export function expectDependency(dependencies: Map<string, Map<string, LCEDependency>>, sourceFqn: string, targetFqn: string, cardinality: number) {
    const dependency = dependencies.get(sourceFqn)?.get(targetFqn);
    expect(dependency).not.toBeUndefined();
    expect(dependency!.cardinality).toBe(cardinality);
}
