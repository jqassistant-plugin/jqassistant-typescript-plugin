package org.jqassistant.plugin.typescript.react;

import com.buschmais.jqassistant.core.shared.io.ClasspathResource;
import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.api.model.react.ReactComponentDescriptor;
import org.jqassistant.plugin.typescript.react.assertions.ReactComponentAssertions;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic integration test for the React part of the jQA TypeScript Plugin.
 * This only checks that basic graph structures are generated. It is not exhaustive for all potential scan results.
 */
public class TypescriptScannerReactIT extends AbstractPluginIT {

    Descriptor scannedDescriptor;

    @Test
    void testScanner() {
        File file = ClasspathResource.getFile(TypescriptScannerReactIT.class, "/java-it-react-sample-ts-output.json");
        scannedDescriptor = getScanner().scan(file, file.getAbsolutePath(), TypescriptScope.PROJECT);
        store.beginTransaction();

        TestResult testResult = query("MATCH (project:TS:Project) RETURN project");
        assertThat(testResult.getColumns())
            .as("project is present in the graph")
            .containsKey("project");
        List<ProjectDescriptor> projects = testResult.getColumn("project");
        assertThat(projects)
            .as("there is only one scanned project")
            .hasSize(1);

        ProjectDescriptor project = projects.get(0);

        // retrieve all React Components
        testResult = query("MATCH (component:TS:ReactComponent) RETURN component");
        assertThat(testResult.getColumns())
            .as("React components are present in the graph")
            .containsKey("component");
        List<ReactComponentDescriptor> components = testResult.getColumn("component");

        // normally, the following path would be absolute
        // when regenerating the json, please crop the extracted path accordingly
        assertThat(project.getFileName())
            .as("project has correct path")
            .isEqualTo("java/src/test/resources/java-it-react-sample-project");

        new ReactComponentAssertions(project, components)
            .assertModulePresence()
            .assertReactComponentWithContent();

        store.commitTransaction();
    }
}
