package org.jqassistant.plugin.typescript.impl.ts;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import org.jqassistant.plugin.typescript.api.model.ClassDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.ModuleDescriptor;
import org.jqassistant.plugin.typescript.impl.model.Module;
import org.jqassistant.plugin.typescript.impl.model.ScanResultCollection;

import java.util.*;

public class ModuleMapper {

    public static final ModuleMapper INSTANCE = new ModuleMapper();

    public List<ModuleDescriptor> map(ScanResultCollection scanResultCollection, Scanner scanner) {
        FileResolver fileResolver = scanner.getContext().peek(FileResolver.class);
        List<ModuleDescriptor> result = new ArrayList<>();

        Map<String, List<ClassDeclarationDescriptor>> classDeclarations = new HashMap<>();
        ClassDeclarationMapper.INSTANCE.mapList(scanResultCollection.getClassDeclaration(), scanner)
            .forEach(classDeclarationDescriptor -> {
                classDeclarations.merge(classDeclarationDescriptor.getFileName(), new ArrayList<>(List.of(classDeclarationDescriptor)), (o, n) -> {
                    o.addAll(n);
                    return  o;
                });
            });

        for(Module module : scanResultCollection.getModule()) {
            FileDescriptor fileDescriptor = fileResolver.match(module.getPath(), FileDescriptor.class, scanner.getContext());
            ModuleDescriptor moduleDescriptor = scanner.getContext().getStore().addDescriptorType(fileDescriptor, ModuleDescriptor.class);

            moduleDescriptor.getClassDeclarations().addAll(classDeclarations.getOrDefault(module.getPath(), new ArrayList<>(List.of())));

            result.add(moduleDescriptor);
        }

        return result;
    }

}
