package org.jqassistant.plugin.typescript.core.basics;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import org.jqassistant.plugin.typescript.TestUtils;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.core.basics.assertions.DeclarationAssertions;
import org.jqassistant.plugin.typescript.core.basics.assertions.DependencyAssertions;
import org.jqassistant.plugin.typescript.core.basics.assertions.TypeAssertions;
import org.jqassistant.plugin.typescript.core.basics.assertions.ValueAssertions;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic integration test for the basic features of the core part of the jQA TypeScript Plugin.
 * This only checks that basic graph structures are generated. It is not exhaustive for all potential scan results.
 */
public class TypescriptScannerCoreBasicsIT extends AbstractPluginIT {

    Descriptor scannedDescriptor;

    @Test
    void testScanner() {
        TestUtils utils = new TestUtils();
        File file = utils.getReportJson("java-it-core-basics-sample-ts-output");
        scannedDescriptor = getScanner().scan(file, file.getAbsolutePath(), TypescriptScope.PROJECT);
        store.beginTransaction();

        TestResult testResult = query("MATCH (project:TS:Project) RETURN project");
        assertThat(testResult.getColumns())
            .as("project is present in the graph")
            .containsKey("project");
        List<ProjectDescriptor> projects = testResult.getColumn("project");
        assertThat(projects)
            .as("there's only one scanned project")
            .hasSize(1);

        ProjectDescriptor project = projects.get(0);

        // normally, the following path would be absolute
        // when regenerating the json, please crop the extracted path accordingly
        assertThat(project.getRootDirectory().getFileName())
            .as("project has correct path")
            .isEqualTo(utils.resolvePath("/java/src/test/resources/java-it-core-basics-sample-project"));

        assertThat(project.getConfigFile().getFileName())
            .as("project has correct config file")
            .isEqualTo(utils.resolvePath("/java/src/test/resources/java-it-core-basics-sample-project/tsconfig.json"));

        assertThat(project.getReferencedProjects())
            .as("project has no references")
            .hasSize(0);

        new DeclarationAssertions(project, utils)
            .assertModulePresence()
            .assertVariableDeclaration()
            .assertFunctionDeclaration()
            .assertClassDeclaration()
            .assertInterfaceDeclaration()
            .assertEnumDeclaration();

        new TypeAssertions(project, utils)
            .assertModulePresence()
            .assertPrimitiveType()
            .assertDeclaredType()
            .assertUnionType()
            .assertIntersectionType()
            .assertObjectType()
            .assertFunctionType()
            .assertLiteralType()
            .assertTupleType();

        new ValueAssertions(project, utils)
            .assertModulePresence()
            .assertValueNull()
            .assertValueLiteral()
            .assertValueDeclared()
            .assertValueObject()
            .assertValueArray()
            .assertValueFunction()
            .assertValueCall()
            .assertValueClass()
            .assertValueComplex();

        new DependencyAssertions(project)
            .assertModulePresence()
            .assertSimpleDependency();

        store.commitTransaction();
    }
}
