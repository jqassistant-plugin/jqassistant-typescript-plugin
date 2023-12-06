package org.jqassistant.plugin.typescript.core.assertions;

import org.jqassistant.plugin.typescript.api.model.core.ModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.VariableDeclarationDescriptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.type;

public class DependencyAssertions {

    ProjectDescriptor project;
    ModuleDescriptor module1;
    ModuleDescriptor module2;

    public DependencyAssertions(ProjectDescriptor project) {
        this.project = project;
    }

    public DependencyAssertions assertModulePresence() {
        Optional<ModuleDescriptor> module1DescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getFqn().equals("./src/testDep1.ts"))
            .findFirst();

        assertThat(module1DescriptorOptional)
            .as("dependency source module is present")
            .isPresent();

        module1DescriptorOptional.ifPresent(moduleDescriptor -> this.module1 = moduleDescriptor);

        Optional<ModuleDescriptor> module2DescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getFqn().equals("./src/testDep2.ts"))
            .findFirst();

        assertThat(module2DescriptorOptional)
            .as("dependency target module is present")
            .isPresent();

        module2DescriptorOptional.ifPresent(moduleDescriptor -> this.module2 = moduleDescriptor);

        return this;
    }

    public DependencyAssertions assertSimpleDependency() {
        assertThat(module1.getVariableDeclarations())
            .as("source module only has one variable declaration")
            .hasSize(1);

        VariableDeclarationDescriptor decl = module1.getVariableDeclarations().get(0);

        assertThat(module1.getExportedDeclarations())
            .as("source module exports one variable declaration")
            .hasSize(1)
            .first()
            .extracting("exportedDeclaration", type(TypeScriptDescriptor.class))
            .isInstanceOf(VariableDeclarationDescriptor.class)
            .isEqualTo(decl);

        return this;
    }

}
