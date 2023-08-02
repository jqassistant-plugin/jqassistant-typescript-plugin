package org.jqassistant.plugin.typescript.impl.ts;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import org.jqassistant.plugin.typescript.api.model.ProjectDescriptor;
import org.jqassistant.plugin.typescript.impl.model.ScanResultCollection;

public class ProjectMapper {

    public static final ProjectMapper INSTANCE = new ProjectMapper();

    public ProjectDescriptor map(ScanResultCollection scanResultCollection, Scanner scanner) {
        FileResolver fileResolver = scanner.getContext().peek(FileResolver.class);
        FileDescriptor fileDescriptor = fileResolver.match(scanResultCollection.getProject().get(0).getProjectRoot(), DirectoryDescriptor.class, scanner.getContext());
        ProjectDescriptor result = scanner.getContext().getStore().addDescriptorType(fileDescriptor, ProjectDescriptor.class);

        result.getModules().addAll(
            ModuleMapper.INSTANCE.map(scanResultCollection, scanner)
        );

        return result;
    }

}
