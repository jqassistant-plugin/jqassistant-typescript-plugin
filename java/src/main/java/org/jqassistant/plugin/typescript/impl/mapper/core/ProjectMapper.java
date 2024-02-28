package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.impl.filesystem.LocalFileResolver;
import org.jqassistant.plugin.typescript.impl.mapper.react.ReactComponentResolver;
import org.jqassistant.plugin.typescript.impl.model.core.Project;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class ProjectMapper {

    public static final ProjectMapper INSTANCE = new ProjectMapper();

    public List<ProjectDescriptor> map(List<Project> projects, Scanner scanner) {
        List<ProjectDescriptor> result = new ArrayList<>();

        // TODO: scan project root directory for file/directory nodes of projects
        // 1. determine all independent root directories (exclude contained ones)
        // 2. scan determined directories while ignoring node_modules directory


        ScannerContext context = scanner.getContext();
        context.push(FqnResolver.class, new FqnResolver());


        for (var project : projects) {
            FileResolver fileResolver = new LocalFileResolver(Paths.get(project.getRootPath()));
            scanner.getContext().push(FileResolver.class, fileResolver);

            ProjectDescriptor projectDescriptor = scanner.getContext().getStore().create(ProjectDescriptor.class);

            DirectoryDescriptor rootDirDescriptor = fileResolver.require(project.getRootPath(), DirectoryDescriptor.class, scanner.getContext());
            projectDescriptor.setRootDirectory(rootDirDescriptor);

            FileDescriptor configFileDescriptor = fileResolver.require(project.getProjectPath() + "/tsconfig.json", FileDescriptor.class, scanner.getContext());
            projectDescriptor.setConfigFile(configFileDescriptor);

            projectDescriptor.getModules().addAll(
                ModuleMapper.INSTANCE.map(project.getConcepts(), scanner)
            );
            projectDescriptor.getExternalModules().addAll(
                ExternalModuleMapper.INSTANCE.map(project.getConcepts(), scanner)
            );

            ReactComponentResolver.resolve(scanner, project.getConcepts().getReactComponents());

            result.add(projectDescriptor);
            scanner.getContext().pop(FileResolver.class);
        }

        // Set references projects and transitively add source files
        for (ProjectDescriptor projectDescriptor : result) {
            Optional<Project> projectOpt = projects.stream()
                .filter(p -> {
                    var configFilePath = projectDescriptor.getConfigFile().getFileName();
                    var projectDir = configFilePath.substring(0, configFilePath.length() - "/tsconfig.json".length());
                    return projectDir.equals(p.getProjectPath());
                })
                .findFirst();
            if (projectOpt.isPresent()) {
                Project project = projectOpt.get();

                project.getSubProjectPaths().forEach(spp -> {
                    Optional<ProjectDescriptor> subprojectDescriptorOpt = result.stream()
                        .filter(pd -> pd.getConfigFile().getFileName().equals(spp + "/tsconfig.json"))
                        .findFirst();

                    if (subprojectDescriptorOpt.isPresent()) {
                        projectDescriptor.getReferencedProjects().add(subprojectDescriptorOpt.get());
                    } else {
                        throw new IllegalStateException("Could not find project descriptor for project path: " + spp);
                    }
                });

                // TODO: Should we transitively add modules? Maybe with flagged relationships?
//                context.getStore().executeQuery(
//                    "MATCH (project:TS:Project)-[:REFERENCES]->(subproject:TS:Project)-[:CONTAINS]->(module:TS:Module)" +
//                        "CREATE (project)-[:CONTAINS]->(module)"
//                );
            } else {
                throw new IllegalStateException("Could not find project for config file path: " + projectDescriptor.getConfigFile().getFileName());
            }
        }

        DependencyResolver.resolve(scanner, projects.stream()
            .flatMap(p -> p.getConcepts().getDependencies().stream())
            .collect(Collectors.toList()));
        ExportDeclarationResolver.resolve(scanner, projects.stream()
            .flatMap(p -> p.getConcepts().getExportDeclarations().stream())
            .collect(Collectors.toList()));

        context.pop(FqnResolver.class).resolveAll();


        return result;
    }

}
