package org.jqassistant.plugin.typescript;

import com.buschmais.jqassistant.core.shared.io.ClasspathResource;
import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeAliasDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeFunctionDescriptor;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic integration test for the Java part of the jQA TypeScript Plugin.
 * This only checks that basic graph structures are generated. It is not exhaustive for all potential scan results.
 */
public class TypescriptScannerIT extends AbstractPluginIT {

    Descriptor scannedDescriptor;

    @Test
    void testScanner() {
        File file = ClasspathResource.getFile(TypescriptScannerIT.class, "/java-it-sample-ts-output.json");
        scannedDescriptor = getScanner().scan(file, file.getAbsolutePath(), TypescriptScope.PROJECT);
        store.beginTransaction();

        // TODO: remove
        TestResult debug2 = query("MATCH (n:TS:TypeAlias {name:\"typeFunction\"})-[:OF_TYPE]->(t:Type:Function)-[r:HAS_PARAMETER]->(p) RETURN COUNT(r)");
        var parameterCount = debug2.getColumn("COUNT(r)").get(0);

        TestResult debug = query("MATCH (n:TS:TypeAlias {name:\"typeFunction\"}) RETURN n");
        List<TypeAliasDeclarationDescriptor> aliases = debug.getColumn("n");
        var parametersSize = ((TypeFunctionDescriptor)aliases.get(0).getType()).getFunctionParameters().size();

        TestResult testResult = query("MATCH (project:TS:Project) RETURN project");
        List<ProjectDescriptor> projects = testResult.getColumn("project");
        assertThat(projects)
            .as("there's only one scanned project")
            .hasSize(1);

        ProjectDescriptor project = projects.get(0);

        // normally, the following path would be absolute
        // when regenerating the json, please crop the extracted path accordingly
        assertThat(project.getFileName())
            .as("project has correct path")
            .isEqualTo("java/src/test/resources/java-it-sample-project");

        new DeclarationAssertions(project)
            .assertModulePresence()
            .assertVariableDeclaration()
            .assertFunctionDeclaration()
            .assertClassDeclaration()
            .assertInterfaceDeclaration()
            .assertEnumDeclaration();

        new TypeAssertions(project)
            .assertModulePresence()
            .assertPrimitiveType()
            .assertDeclaredType()
            .assertUnionType()
            .assertIntersectionType()
            .assertObjectType()
            .assertFunctionType()
            .assertLiteralType()
            .assertTupleType();

        new ValueAssertions(project)
            .assertModulePresence()
            .assertValueNull()
            .assertValueLiteral()
            .assertValueDeclared()
            .assertValueObject()
            .assertValueArray();

        store.commitTransaction();
    }
}
