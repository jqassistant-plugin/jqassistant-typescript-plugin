package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import org.jqassistant.plugin.typescript.api.model.core.ProjectDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.ScanResultCollection;

public class ProjectMapper {

    public static final ProjectMapper INSTANCE = new ProjectMapper();

    public ProjectDescriptor map(ScanResultCollection scanResultCollection, Scanner scanner) {
        FileResolver fileResolver = scanner.getContext().peek(FileResolver.class);
        FileDescriptor fileDescriptor = fileResolver.match(scanResultCollection.getProject().get(0).getProjectRoot(), DirectoryDescriptor.class, scanner.getContext());
        ProjectDescriptor result = scanner.getContext().getStore().addDescriptorType(fileDescriptor, ProjectDescriptor.class);

        ScannerContext context = scanner.getContext();

        context.push(FqnResolver.class, new FqnResolver());

        result.getModules().addAll(
            ModuleMapper.INSTANCE.map(scanResultCollection, scanner)
        );

        result.getExternalModules().addAll(
            ExternalModuleMapper.INSTANCE.map(scanResultCollection, scanner)
        );

        DependencyResolver.resolve(scanner, scanResultCollection.getDependencies());
        ExportDeclarationResolver.resolve(scanner, scanResultCollection.getExportDeclarations());

        context.pop(FqnResolver.class).resolveAll();

        return result;
    }

}
