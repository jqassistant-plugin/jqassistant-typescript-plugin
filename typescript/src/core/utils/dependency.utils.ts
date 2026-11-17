import { LCEConcept, LCENamedConcept } from "../concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { LCEProject } from "../project";
import { debug, DEBUG_LOGGING } from "./log.utils";

/**
 * Lists all dependencies whose source or target FQN matches no extracted concept (only with debug logging enabled).
 * The jQAssistant plugin cannot create relations for these dependencies and drops them.
 */
export function debugUnresolvedDependencies(projects: LCEProject[]): void {
    if (!DEBUG_LOGGING) {
        return;
    }

    const knownFqns = new Set<string>();
    for (const project of projects) {
        for (const [conceptId, concepts] of project.concepts) {
            if (conceptId !== LCEDependency.conceptId) {
                collectFqns(concepts, knownFqns);
            }
        }
    }

    for (const project of projects) {
        const dependencies = (project.concepts.get(LCEDependency.conceptId) ?? []) as LCEDependency[];
        const unresolved = dependencies.filter((dep) => !knownFqns.has(dep.globalSourceFQN) || !knownFqns.has(dep.fqn.globalFqn));
        if (unresolved.length > 0) {
            debug(`${unresolved.length} of ${dependencies.length} dependencies of project ${project.projectInfo.configPath} refer to unknown FQNs:`);
            for (const dep of unresolved) {
                debug(`\t${dep.globalSourceFQN} -> ${dep.fqn.globalFqn}`);
            }
        }
    }
}

/**
 * Collects the global FQNs of all named concepts contained in the given value, including nested ones (e.g. class members)
 */
function collectFqns(value: unknown, fqns: Set<string>): void {
    if (Array.isArray(value)) {
        for (const item of value) {
            collectFqns(item, fqns);
        }
    } else if (value instanceof LCEConcept) {
        if (value instanceof LCENamedConcept) {
            fqns.add(value.fqn.globalFqn);
        }
        for (const [key, child] of Object.entries(value)) {
            if (key !== "metadata") {
                collectFqns(child, fqns);
            }
        }
    }
}
