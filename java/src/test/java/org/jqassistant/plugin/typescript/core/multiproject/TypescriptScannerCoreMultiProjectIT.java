package org.jqassistant.plugin.typescript.core.multiproject;

import com.buschmais.jqassistant.core.shared.io.ClasspathResource;
import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.core.ModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Basic integration test for the basic features of the core part of the jQA TypeScript Plugin.
 * This only checks that basic graph structures are generated. It is not exhaustive for all potential scan results.
 */
public class TypescriptScannerCoreMultiProjectIT extends AbstractPluginIT {

    Descriptor scannedDescriptor;

    @Test
    void testScanner() {
        File file = ClasspathResource.getFile(TypescriptScannerCoreMultiProjectIT.class, "/java-it-core-multi-sample-ts-output.json");
        scannedDescriptor = getScanner().scan(file, file.getAbsolutePath(), TypescriptScope.PROJECT);
        store.beginTransaction();

        TestResult testResult = query("MATCH (project:TS:Project) RETURN project");
        assertThat(testResult.getColumns())
            .as("project is present in the graph")
            .containsKey("project");
        Map<String, ProjectDescriptor> projects = new HashMap<>();
        testResult.getColumn("project")
            .forEach(p -> projects.put(((ProjectDescriptor) p).getRootDirectory().getFileName(), (ProjectDescriptor) p));
        assertThat(projects)
            .as("there's only one scanned project")
            .hasSize(7);

        // project nodes
        ProjectDescriptor project1 = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/project1");
        ProjectDescriptor project2 = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/project2");
        ProjectDescriptor project3 = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/project3");
        ProjectDescriptor project31 = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/project3/subproject31");
        ProjectDescriptor project32 = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/project3/subproject32");
        ProjectDescriptor projectCommon = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/subprojectCommon");
        ProjectDescriptor project331 = projects.get("/java/src/test/resources/java-it-core-multi-sample-projects/subprojectCommon/subproject331");


        // basic project (project1)
        assertThat(project1)
            .as("project has correct root path")
            .isNotNull();
        assertThat(project1.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/project1/tsconfig.json");
        assertThat(project1.getReferencedProjects())
            .as("project has no references")
            .hasSize(0);
        assertThat(project1.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modules1 = project1.getModules();
        assertThat(modules1)
            .as("project has correct number of modules")
            .hasSize(2);

        var module1_1Opt = modules1.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(module1_1Opt)
            .as("module is present")
            .isPresent();
        var module1_1 = module1_1Opt.get();
        assertThat(module1_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(2);
        assertThat(module1_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(2);

        var module1_2Opt = modules1.stream().filter(mod -> mod.getLocalFqn().equals("./src/module2.ts")).findFirst();
        assertThat(module1_2Opt)
            .as("module is present")
            .isPresent();
        var module1_2 = module1_2Opt.get();
        assertThat(module1_2.getTypeAliasDeclarations())
            .as("module has correct number of type alias declarations")
            .hasSize(1);
        assertThat(module1_2.getInterfaceDeclarations())
            .as("module has correct number of interface declarations")
            .hasSize(1);
        assertThat(module1_2.getClassDeclarations())
            .as("module has correct number of class declarations")
            .hasSize(1);
        assertThat(module1_2.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(3);


        // sibling project using a common reference project (project2)
        assertThat(project2)
            .as("project has correct root path")
            .isNotNull();
        assertThat(project2.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/project2/tsconfig.json");
        assertThat(project2.getReferencedProjects())
            .as("project has correct references")
            .containsExactlyInAnyOrder(project331, projectCommon);
        assertThat(project2.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modules2 = project2.getModules();
        assertThat(modules2)
            .as("project has correct number of modules")
            .hasSize(2);

        var module2_1Opt = modules2.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(module2_1Opt)
            .as("module is present")
            .isPresent();
        var module2_1 = module2_1Opt.get();
        assertThat(module2_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(2);
        assertThat(module2_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(2);

        var module2_2Opt = modules2.stream().filter(mod -> mod.getLocalFqn().equals("./src/module2.ts")).findFirst();
        assertThat(module2_2Opt)
            .as("module is present")
            .isPresent();
        var module2_2 = module2_2Opt.get();
        assertThat(module2_2.getTypeAliasDeclarations())
            .as("module has correct number of type alias declarations")
            .hasSize(1);
        assertThat(module2_2.getInterfaceDeclarations())
            .as("module has correct number of interface declarations")
            .hasSize(1);
        assertThat(module2_2.getClassDeclarations())
            .as("module has correct number of class declarations")
            .hasSize(1);
        assertThat(module2_2.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(3);


        // root project using a multiple reference projects (project3)
        assertThat(project3)
            .as("project has correct root path")
            .isNotNull();
        assertThat(project3.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/project3/tsconfig.json");
        assertThat(project3.getReferencedProjects())
            .as("project has correct references")
            .containsExactlyInAnyOrder(project331, projectCommon, project31, project32);
        assertThat(project3.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modules3 = project3.getModules();
        assertThat(modules3)
            .as("project has correct number of modules")
            .hasSize(1);

        var module3_1Opt = modules3.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(module3_1Opt)
            .as("module is present")
            .isPresent();
        var module3_1 = module3_1Opt.get();
        assertThat(module3_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(1);
        assertThat(module3_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(1);


        // subproject (project31)
        assertThat(project31)
            .as("project has correct root path")
            .isNotNull();
        assertThat(project31.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/project3/subproject31/tsconfig.json");
        assertThat(project31.getReferencedProjects())
            .as("project has no references")
            .hasSize(0);
        assertThat(project31.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modules31 = project31.getModules();
        assertThat(modules31)
            .as("project has correct number of modules")
            .hasSize(1);

        var module31_1Opt = modules31.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(module31_1Opt)
            .as("module is present")
            .isPresent();
        var module31_1 = module31_1Opt.get();
        assertThat(module31_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(1);
        assertThat(module31_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(1);

        // subproject (project32)
        assertThat(project32)
            .as("project has correct root path")
            .isNotNull();
        assertThat(project32.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/project3/subproject32/tsconfig.json");
        assertThat(project32.getReferencedProjects())
            .as("project has no references")
            .hasSize(0);
        assertThat(project32.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modules32 = project32.getModules();
        assertThat(modules32)
            .as("project has correct number of modules")
            .hasSize(1);

        var module32_1Opt = modules32.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(module32_1Opt)
            .as("module is present")
            .isPresent();
        var module32_1 = module32_1Opt.get();
        assertThat(module32_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(1);
        assertThat(module32_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(1);


        // subproject (projectCommon)
        assertThat(projectCommon)
            .as("project has correct root path")
            .isNotNull();
        assertThat(projectCommon.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/subprojectCommon/tsconfig.json");
        assertThat(projectCommon.getReferencedProjects())
            .as("project has correct references")
            .containsExactlyInAnyOrder(project331);
        assertThat(projectCommon.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modulesCommon = projectCommon.getModules();
        assertThat(modulesCommon)
            .as("project has correct number of modules")
            .hasSize(1);

        var moduleCommon_1Opt = modulesCommon.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(moduleCommon_1Opt)
            .as("module is present")
            .isPresent();
        var moduleCommon_1 = moduleCommon_1Opt.get();
        assertThat(moduleCommon_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(1);
        assertThat(moduleCommon_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(1);


        // subproject (project331)
        assertThat(project331)
            .as("project has correct root path")
            .isNotNull();
        assertThat(project331.getConfigFile().getFileName())
            .as("project has correct config path")
            .isEqualTo("/java/src/test/resources/java-it-core-multi-sample-projects/subprojectCommon/subproject331/tsconfig.json");
        assertThat(project331.getReferencedProjects())
            .as("project has no references")
            .hasSize(0);
        assertThat(project331.getExternalModules())
            .as("project has no external modules")
            .hasSize(0);

        var modules331 = project331.getModules();
        assertThat(modules331)
            .as("project has correct number of modules")
            .hasSize(1);

        var module331_1Opt = modules331.stream().filter(mod -> mod.getLocalFqn().equals("./src/module1.ts")).findFirst();
        assertThat(module331_1Opt)
            .as("module is present")
            .isPresent();
        var module331_1 = module331_1Opt.get();
        assertThat(module331_1.getVariableDeclarations())
            .as("module has correct number of variable declarations")
            .hasSize(1);
        assertThat(module331_1.getExportedDeclarations())
            .as("module exports correct number of declarations")
            .hasSize(1);


        // check dependencies between modules
        assertModuleDependency(module1_1, module1_2, 2);
        assertModuleDependency(module2_1, module2_2, 2);
        assertModuleDependency(module2_1, module331_1, 1);
        assertModuleDependency(module3_1, module331_1, 1);
        assertModuleDependency(module3_1, moduleCommon_1, 1);
        assertModuleDependency(module3_1, module31_1, 1);
        assertModuleDependency(module3_1, module32_1, 1);

        store.commitTransaction();
    }

    private void assertModuleDependency(ModuleDescriptor src, ModuleDescriptor trgt, int cardinality) {
        assertThat(src.getDependencies())
            .anySatisfy(dep -> {
                assertThat(dep.getDependency()).isEqualTo(trgt);
                assertThat(dep.getCardinality()).isEqualTo(cardinality);
            });
    }
}
