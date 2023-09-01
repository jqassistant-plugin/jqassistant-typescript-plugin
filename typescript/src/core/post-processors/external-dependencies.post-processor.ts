import { PostProcessor } from "../post-processor";
import { LCEConcept } from "../concept";
import { LCEDependency } from "../concepts/dependency.concept";
import { LCEExternalDeclaration, LCEExternalModule } from "../concepts/externals.concept";
import { PathUtils } from "../utils/path.utils";

export class ExternalDependenciesPostProcessor extends PostProcessor {
    postProcess(concepts: Map<string, LCEConcept[]>): void {
        const allDependencies: LCEDependency[] = (concepts.get(LCEDependency.conceptId) ?? []) as LCEDependency[];
        const externalModules: Map<string, LCEExternalModule> = new Map();
        const externalDeclarations: Map<string, Map<string, LCEExternalDeclaration>> = new Map();
        for (const dep of allDependencies) {
            const external = PathUtils.isExternal(dep.targetType === "module" ? dep.fqn : PathUtils.extractFQNPath(dep.fqn));
            if (external) {
                if (dep.targetType === "declaration") {
                    const modulePath = PathUtils.extractFQNPath(dep.fqn);
                    if (!externalModules.has(modulePath)) {
                        externalModules.set(modulePath, new LCEExternalModule(modulePath, []));
                        externalDeclarations.set(modulePath, new Map());
                    }
                    if (!externalDeclarations.get(modulePath)!.has(dep.fqn)) {
                        externalDeclarations
                            .get(modulePath)!
                            .set(dep.fqn, new LCEExternalDeclaration(dep.fqn, PathUtils.extractFQNIdentifier(dep.fqn)));
                    }
                } else if (!externalModules.has(dep.fqn)) {
                    externalModules.set(dep.fqn, new LCEExternalModule(dep.fqn, []));
                    externalDeclarations.set(dep.fqn, new Map());
                }
            }
        }
        for (const entry of externalDeclarations.entries()) {
            externalModules.get(entry[0])!.declarations = [...entry[1].values()];
        }

        concepts.set(LCEExternalModule.conceptId, [...externalModules.values()]);
    }
}
