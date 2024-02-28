package org.jqassistant.plugin.typescript.react.assertions;

import org.jqassistant.plugin.typescript.TestUtils;
import org.jqassistant.plugin.typescript.api.model.core.ModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.api.model.react.ReactComponentDescriptor;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

public class ReactComponentAssertions {

    TestUtils utils;
    ProjectDescriptor project;
    ModuleDescriptor module;

    List<ReactComponentDescriptor> components;

    public ReactComponentAssertions(ProjectDescriptor projectDescriptor, List<ReactComponentDescriptor> components, TestUtils utils) {
        this.project = projectDescriptor;
        this.components = components;
        this.utils = utils;
    }

    public ReactComponentAssertions assertModulePresence() {
        Optional<ModuleDescriptor> moduleDescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getLocalFqn().equals("./src/testComponents.tsx"))
            .findFirst();

        assertThat(moduleDescriptorOptional.isPresent())
            .as("components module is present")
            .isTrue();

        moduleDescriptorOptional.ifPresent(moduleDescriptor -> this.module = moduleDescriptor);

        return this;
    }

    public ReactComponentAssertions assertReactComponentWithContent() {
        assertThat(components)
            .as("react component with content is present")
            .anySatisfy(comp -> {
                assertThat(comp)
                    .as("component has properties set correctly")
                    .hasFieldOrPropertyWithValue("globalFqn", "\"" + utils.resolvePath("/java/src/test/resources/java-it-react-sample-project/src/testComponents.tsx") + "\".ComponentWithContent")
                    .hasFieldOrPropertyWithValue("localFqn", "\"./src/testComponents.tsx\".ComponentWithContent")
                    .hasFieldOrPropertyWithValue("componentName", "ComponentWithContent");

                ReactComponentDescriptor otherComponent = components.stream()
                    .filter(c -> c.getComponentName().equals("SomeComponent"))
                    .findFirst()
                    .orElseThrow();

                assertThat(comp.getRenderedElements())
                    .hasSize(5)
                    .anySatisfy(elem -> {
                        assertThat(elem.getJSXElementType())
                            .as("rendered div element is defined correctly")
                            .hasFieldOrPropertyWithValue("globalFqn", "div")
                            .hasFieldOrPropertyWithValue("name", "div");
                        assertThat(elem.getCardinality())
                            .as("rendered element relation has correct cardinality")
                            .isEqualTo(2);
                    })
                    .anySatisfy(elem -> {
                        assertThat(elem.getJSXElementType())
                            .as("rendered button element is defined correctly")
                            .hasFieldOrPropertyWithValue("globalFqn", "button")
                            .hasFieldOrPropertyWithValue("name", "button");
                        assertThat(elem.getCardinality())
                            .as("rendered element relation has correct cardinality")
                            .isEqualTo(1);
                    })
                    .anySatisfy(elem -> {
                        assertThat(elem.getJSXElementType())
                            .as("rendered h1 element is defined correctly")
                            .hasFieldOrPropertyWithValue("globalFqn", "h1")
                            .hasFieldOrPropertyWithValue("name", "h1");
                        assertThat(elem.getCardinality())
                            .as("rendered element relation has correct cardinality")
                            .isEqualTo(1);
                    })
                    .anySatisfy(elem -> {
                        assertThat(elem.getJSXElementType())
                            .as("rendered h2 element is defined correctly")
                            .hasFieldOrPropertyWithValue("globalFqn", "h2")
                            .hasFieldOrPropertyWithValue("name", "h2");
                        assertThat(elem.getCardinality())
                            .as("rendered element relation has correct cardinality")
                            .isEqualTo(2);
                    })
                    .anySatisfy(elem -> {
                        assertThat(elem.getJSXElementType())
                            .as("rendered component element is defined correctly")
                            .hasFieldOrPropertyWithValue("globalFqn", "\"" + utils.resolvePath("/java/src/test/resources/java-it-react-sample-project/src/testComponents.tsx") + "\".SomeComponent")
                            .hasFieldOrPropertyWithValue("name", "SomeComponent");
                        assertThat(elem.getCardinality())
                            .as("rendered element relation has correct cardinality")
                            .isEqualTo(3);
                        assertThat(elem.getJSXElementType().getReference())
                            .as("rendered component element references correct component")
                            .isEqualTo(otherComponent);
                    });

                assertThat(comp.getDependencies())
                    .as("component has correct dependencies")
                    .hasSize(3)
                    .anySatisfy(dep -> {
                        assertThat(dep.getDependency()).isEqualTo(otherComponent);
                        assertThat(dep.getCardinality()).isEqualTo(3);
                    });
            });
        return this;
    }
}
