package org.jqassistant.plugin.typescript.core.basics.assertions;

import org.jqassistant.plugin.typescript.api.model.core.DependsOnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.EnumDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.FunctionDeclarationDescriptor;
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
            .filter((mod) -> mod.getLocalFqn().equals("./src/testDep1.ts"))
            .findFirst();

        assertThat(module1DescriptorOptional)
            .as("dependency source module is present")
            .isPresent();

        module1DescriptorOptional.ifPresent(moduleDescriptor -> this.module1 = moduleDescriptor);

        Optional<ModuleDescriptor> module2DescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getLocalFqn().equals("./src/testDep2.ts"))
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

    public DependencyAssertions assertDependencyThroughReExport() {
        Optional<FunctionDeclarationDescriptor> callingFunctionOptional = module2.getFunctionDeclarations().stream()
            .filter((func) -> func.getName().equals("callThroughBarrel"))
            .findFirst();

        assertThat(callingFunctionOptional)
            .as("function calling a re-exported function is present")
            .isPresent();

        Optional<FunctionDeclarationDescriptor> calledFunctionOptional = project.getModules().stream()
            .filter((mod) -> mod.getLocalFqn().equals("./src/testDep3.ts"))
            .flatMap((mod) -> mod.getFunctionDeclarations().stream())
            .filter((func) -> func.getName().equals("reExportedFunction"))
            .findFirst();

        assertThat(calledFunctionOptional)
            .as("re-exported function is present")
            .isPresent();

        assertThat(callingFunctionOptional.get().getDependencies())
            .as("function called through a re-exporting module is a dependency")
            .anySatisfy(dep -> {
                assertThat(dep.getDependency()).isEqualTo(calledFunctionOptional.get());
                assertThat(dep.getCardinality()).isEqualTo(1);
            });

        return this;
    }

    public DependencyAssertions assertEnumDependencies() {
        Optional<EnumDeclarationDescriptor> enumOptional = module2.getEnumDeclarations().stream()
            .filter((enumDecl) -> enumDecl.getName().equals("DependentEnum"))
            .findFirst();

        assertThat(enumOptional)
            .as("enum with member initializers referencing other declarations is present")
            .isPresent();

        EnumDeclarationDescriptor enumDecl = enumOptional.get();

        Optional<VariableDeclarationDescriptor> constantOptional = module1.getVariableDeclarations().stream()
            .filter((variable) -> variable.getName().equals("EXPORT_CONSTANT"))
            .findFirst();

        assertThat(constantOptional)
            .as("constant referenced by the enum is present")
            .isPresent();

        Optional<FunctionDeclarationDescriptor> functionOptional = project.getModules().stream()
            .filter((mod) -> mod.getLocalFqn().equals("./src/testDep3.ts"))
            .flatMap((mod) -> mod.getFunctionDeclarations().stream())
            .filter((func) -> func.getName().equals("reExportedFunction"))
            .findFirst();

        assertThat(functionOptional)
            .as("function called by the enum is present")
            .isPresent();

        assertThat(enumDecl.getDependencies())
            .as("constant referenced in a member initializer is a dependency of the enum")
            .anySatisfy(dep -> {
                assertThat(dep.getDependency()).isEqualTo(constantOptional.get());
                assertThat(dep.getCardinality()).isEqualTo(1);
            });

        assertThat(enumDecl.getDependencies())
            .as("function called in a member initializer is a dependency of the enum")
            .anySatisfy(dep -> {
                assertThat(dep.getDependency()).isEqualTo(functionOptional.get());
                assertThat(dep.getCardinality()).isEqualTo(1);
            });

        assertThat(enumDecl.getDependencies())
            .as("own members referenced in a member initializer are no dependencies of the enum")
            .extracting(DependsOnDescriptor::getDependency)
            .doesNotContainAnyElementsOf(enumDecl.getMembers());

        return this;
    }

}
