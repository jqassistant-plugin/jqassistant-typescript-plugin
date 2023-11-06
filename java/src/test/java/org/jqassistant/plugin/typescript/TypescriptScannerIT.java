package org.jqassistant.plugin.typescript;

import com.buschmais.jqassistant.core.shared.io.ClasspathResource;
import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic integration test for the Java part of the jQA TypeScript Plugin.
 * This only checks that basic graph structures are generated. It is not exhaustive.
 */
public class TypescriptScannerIT extends AbstractPluginIT {

    Descriptor scannedDescriptor;

    @BeforeEach
    void scanFile() {
        File file = ClasspathResource.getFile(TypescriptScannerIT.class, "/java-it-sample-project/.reports/jqa/ts-output.json");
        scannedDescriptor = getScanner().scan(file, file.getAbsolutePath(), TypescriptScope.PROJECT);
        store.beginTransaction();
    }

    @AfterEach
    void teardown() {
        store.commitTransaction();
    }

    @Test
    @TestStore(type = TestStore.Type.REMOTE)
    void testProjectNode() {
        assertThat(scannedDescriptor).isInstanceOf(ProjectDescriptor.class);

        TestResult testResult = query("MATCH (project:TS:Project) RETURN project");
        List<ProjectDescriptor> projects = testResult.getColumn("project");
        assertThat(projects).hasSize(1);

        ProjectDescriptor project = projects.get(0);
        assertThat(project.getFileName()).isEqualTo("jqassistant-typescript-plugin/java/src/test/resources/java-it-sample-project");
        assertThat(project.getModules()).hasSize(2);
        assertThat(project.getExternalModules()).hasSize(0);
    }

    @Nested
    class ModuleDescriptorIT {

        ProjectDescriptor projectDescriptor;

        @BeforeEach
        void setup() {
            TestResult testResult = query("MATCH (project:TS:Project) RETURN project");
            List<ProjectDescriptor> projects = testResult.getColumn("project");
            projectDescriptor = projects.get(0);
        }

        @Test
        void testClassModule() {
            Optional<ModuleDescriptor> moduleDescriptorOptional = projectDescriptor.getModules().stream()
                .filter((mod) -> mod.getFqn().equals("./src/testClass.ts"))
                .findFirst();

            assertThat(moduleDescriptorOptional.isPresent()).isTrue();

            ModuleDescriptor moduleDescriptor = moduleDescriptorOptional.get();

            assertThat(moduleDescriptor.getFqn()).isEqualTo("./src/testClass.ts");
            assertThat(moduleDescriptor.getClassDeclarations()).hasSize(1);
            assertThat(moduleDescriptor.getTypeAliasDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getInterfaceDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getEnumDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getFunctionDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getVariableDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getExportedDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getExportedDeclarations()).hasSize(0);
        }

        @Test
        void testVariableModule() {
            Optional<ModuleDescriptor> moduleDescriptorOptional = projectDescriptor.getModules().stream()
                .filter((mod) -> mod.getFqn().equals("./src/testVariable.ts"))
                .findFirst();

            assertThat(moduleDescriptorOptional.isPresent()).isTrue();

            ModuleDescriptor moduleDescriptor = moduleDescriptorOptional.get();

            assertThat(moduleDescriptor.getFqn()).isEqualTo("./src/testVariable.ts");
            assertThat(moduleDescriptor.getClassDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getTypeAliasDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getInterfaceDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getEnumDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getFunctionDeclarations()).hasSize(0);
            assertThat(moduleDescriptor.getVariableDeclarations()).hasSize(1);
            assertThat(moduleDescriptor.getExportedDeclarations()).hasSize(1);
            assertThat(moduleDescriptor.getExportedDeclarations()).hasSize(1);
        }

        @Nested
        class ClassDeclarationDescriptorIT {
            ClassDeclarationDescriptor classDeclarationDescriptor;

            @BeforeEach
            void setup() {
                Optional<ModuleDescriptor> moduleDescriptorOptional = projectDescriptor.getModules().stream()
                    .filter((mod) -> mod.getFqn().equals("./src/testClass.ts"))
                    .findFirst();
                classDeclarationDescriptor = moduleDescriptorOptional.get().getClassDeclarations().get(0);
            }

            @Test
            void testClass() {
                assertThat(classDeclarationDescriptor.getName()).isEqualTo("Point");
                assertThat(classDeclarationDescriptor.getFqn()).isEqualTo("\"./src/testClass.ts\".Point");
                assertThat(classDeclarationDescriptor.getAbstract()).isFalse();
                assertThat(classDeclarationDescriptor.getProperties()).hasSize(2);
                assertThat(classDeclarationDescriptor.getMethods()).hasSize(2);
                assertThat(classDeclarationDescriptor.getAccessorProperties()).hasSize(0);

                // TODO: prevent Neo4j API of trying to map all DECLARES relationships to the constructor, ignoring the Constructor node label
//                assertThat(classDeclarationDescriptor.getConstructor()).isNotNull();

                // class has dependency to variable and its module
                assertThat(classDeclarationDescriptor.getDependencies()).hasSize(2);
            }
        }

        @Nested
        class VariableDeclarationDescriptorIT {
            VariableDeclarationDescriptor variableDeclarationDescriptor;

            @BeforeEach
            void setup() {
                Optional<ModuleDescriptor> moduleDescriptorOptional = projectDescriptor.getModules().stream()
                    .filter((mod) -> mod.getFqn().equals("./src/testVariable.ts"))
                    .findFirst();
                variableDeclarationDescriptor = moduleDescriptorOptional.get().getVariableDeclarations().get(0);
            }

            @Test
            void testVariable() {
                assertThat(variableDeclarationDescriptor.getName()).isEqualTo("MY_NUMBER");
                assertThat(variableDeclarationDescriptor.getKind()).isEqualTo("const");
                assertThat(variableDeclarationDescriptor.getFqn()).isEqualTo("\"./src/testVariable.ts\".MY_NUMBER");
                assertThat(variableDeclarationDescriptor.getType()).isInstanceOf(TypeLiteralDescriptor.class);
                assertThat(variableDeclarationDescriptor.getInitValue()).isInstanceOf(ValueLiteralDescriptor.class);
            }

        }
    }
}
