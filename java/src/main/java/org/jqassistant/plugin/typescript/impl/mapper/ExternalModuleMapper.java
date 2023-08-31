package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.ExternalDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.ExternalModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.ExternalModuleExportsDescriptor;
import org.jqassistant.plugin.typescript.impl.model.ExternalDeclaration;
import org.jqassistant.plugin.typescript.impl.model.ExternalModule;
import org.jqassistant.plugin.typescript.impl.model.ScanResultCollection;
import org.mapstruct.Context;

import java.util.ArrayList;
import java.util.List;

public class ExternalModuleMapper {

    public static final ExternalModuleMapper INSTANCE = new ExternalModuleMapper();

    public List<ExternalModuleDescriptor> map(ScanResultCollection scanResultCollection, @Context Scanner scanner) {
        ScannerContext scannerContext = scanner.getContext();
        FqnResolver fqnResolver = scanner.getContext().peek(FqnResolver.class);

        List<ExternalModuleDescriptor> result = new ArrayList<>();
        for(ExternalModule extMod : scanResultCollection.getExternalModules()) {
            ExternalModuleDescriptor modDescriptor = scannerContext.getStore().create(ExternalModuleDescriptor.class);
            modDescriptor.setFqn(extMod.getFqn());

            for(ExternalDeclaration extDecl : extMod.getDeclarations()) {
                ExternalDeclarationDescriptor declDescriptor = scannerContext.getStore().create(ExternalDeclarationDescriptor.class);
                declDescriptor.setFqn(extDecl.getFqn());
                fqnResolver.registerFqn(declDescriptor);

                ExternalModuleExportsDescriptor relationDescriptor = scannerContext.getStore().create(modDescriptor, ExternalModuleExportsDescriptor.class, declDescriptor);
                relationDescriptor.setExportedName(extDecl.getName());
            }

            fqnResolver.registerFqn(modDescriptor);
            result.add(modDescriptor);
        }

        return result;
    }

}
