import { PostProcessor } from "../post-processor";
import { LCEDependency } from "../concepts/dependency.concept";
import { LCEExternalDeclaration, LCEExternalModule } from "../concepts/externals.concept";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { LCEProject } from "../project";

export class ExternalDependenciesPostProcessor extends PostProcessor {
    postProcess(projects: LCEProject[]): void {
        for (const project of projects) {
            const concepts = project.concepts;

            const allDependencies: LCEDependency[] = (concepts.get(LCEDependency.conceptId) ?? []) as LCEDependency[];
            const externalModules: Map<string, LCEExternalModule> = new Map();
            const externalDeclarations: Map<string, Map<string, LCEExternalDeclaration>> = new Map();
            for (const dep of allDependencies) {
                const external = ModulePathUtils.isExternal(
                    dep.targetType === "module" ? dep.globalSourceFQN : ModulePathUtils.extractFQNPath(dep.fqn.globalFqn),
                    project.projectInfo,
                    projects,
                );
                if (external) {
                    if (dep.targetType === "declaration") {
                        const modulePath = ModulePathUtils.extractFQNPath(dep.fqn.globalFqn);
                        if (!externalModules.has(modulePath)) {
                            externalModules.set(modulePath, new LCEExternalModule(modulePath, []));
                            externalDeclarations.set(modulePath, new Map());
                        }
                        if (!externalDeclarations.get(modulePath)!.has(dep.fqn.globalFqn)) {
                            externalDeclarations
                                .get(modulePath)!
                                .set(
                                    dep.fqn.globalFqn,
                                    new LCEExternalDeclaration(dep.fqn.globalFqn, ModulePathUtils.extractFQNIdentifier(dep.fqn.globalFqn)),
                                );
                        }
                    } else if (!externalModules.has(dep.fqn.globalFqn)) {
                        externalModules.set(dep.fqn.globalFqn, new LCEExternalModule(dep.fqn.globalFqn, []));
                        externalDeclarations.set(dep.fqn.globalFqn, new Map());
                    }
                }
            }
            for (const entry of externalDeclarations.entries()) {
                externalModules.get(entry[0])!.declarations = [...entry[1].values()];
            }

            concepts.set(LCEExternalModule.conceptId, [...externalModules.values()]);
        }
    }
}
