package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptScanDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.Project;

import java.util.List;

public class TypeScriptScanMapper {

    public static final TypeScriptScanMapper INSTANCE = new TypeScriptScanMapper();

    public TypeScriptScanDescriptor map(List<Project> projects, Scanner scanner) {
        FileDescriptor fileDescriptor = scanner.getContext().getCurrentDescriptor();
        TypeScriptScanDescriptor result = scanner.getContext().getStore().addDescriptorType(fileDescriptor, TypeScriptScanDescriptor.class);
        result.getProjects().addAll(ProjectMapper.INSTANCE.map(projects, scanner));
        return result;
    }

}
