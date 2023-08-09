package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.ExternalDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.ExternalModuleDescriptor;
import org.jqassistant.plugin.typescript.impl.model.ExternalDeclaration;
import org.jqassistant.plugin.typescript.impl.model.ExternalModule;
import org.jqassistant.plugin.typescript.impl.model.ScanResultCollection;

import java.util.ArrayList;
import java.util.List;

public class ExternalModuleMapper {

    public static final ExternalModuleMapper INSTANCE = new ExternalModuleMapper();

    public List<ExternalModuleDescriptor> map(ScanResultCollection scanResultCollection, Scanner scanner) {
        ScannerContext scannerContext = scanner.getContext();
        FqnResolver fqnResolver = scanner.getContext().peek(FqnResolver.class);

        List<ExternalModuleDescriptor> result = new ArrayList<>();
        for(ExternalModule extMod : scanResultCollection.getExternalModules()) {
            ExternalModuleDescriptor modDescriptor = scannerContext.getStore().create(ExternalModuleDescriptor.class);
            modDescriptor.setFqn(extMod.getFqn());

            for(ExternalDeclaration extDecl : extMod.getDeclarations()) {
                ExternalDeclarationDescriptor declDescriptor = scannerContext.getStore().create(ExternalDeclarationDescriptor.class);
                declDescriptor.setFqn(extDecl.getFqn());
                declDescriptor.setName(extDecl.getName());

                fqnResolver.registerFqn(declDescriptor);
                modDescriptor.getDeclarations().add(declDescriptor);
            }

            fqnResolver.registerFqn(modDescriptor);
            result.add(modDescriptor);
        }

        return result;
    }

}
