package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.core.ExternalDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ExternalModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ExternalModuleExportsDescriptor;
import org.jqassistant.plugin.typescript.impl.model.ConceptCollection;
import org.jqassistant.plugin.typescript.impl.model.core.ExternalDeclaration;
import org.jqassistant.plugin.typescript.impl.model.core.ExternalModule;
import org.mapstruct.Context;

import java.util.ArrayList;
import java.util.List;

public class ExternalModuleMapper {

    public static final ExternalModuleMapper INSTANCE = new ExternalModuleMapper();

    public List<ExternalModuleDescriptor> map(ConceptCollection conceptCollection, @Context Scanner scanner) {
        ScannerContext scannerContext = scanner.getContext();
        FqnResolver fqnResolver = scanner.getContext().peek(FqnResolver.class);

        List<ExternalModuleDescriptor> result = new ArrayList<>();
        for(ExternalModule extMod : conceptCollection.getExternalModules()) {
            ExternalModuleDescriptor modDescriptor = scannerContext.getStore().create(ExternalModuleDescriptor.class);
            modDescriptor.setGlobalFqn(extMod.getGlobalFqn());

            for(ExternalDeclaration extDecl : extMod.getDeclarations()) {
                ExternalDeclarationDescriptor declDescriptor = scannerContext.getStore().create(ExternalDeclarationDescriptor.class);
                declDescriptor.setGlobalFqn(extDecl.getGlobalFqn());
                fqnResolver.registerGlobalFqn(declDescriptor);

                ExternalModuleExportsDescriptor relationDescriptor = scannerContext.getStore().create(modDescriptor, ExternalModuleExportsDescriptor.class, declDescriptor);
                relationDescriptor.setExportedName(extDecl.getName());
            }

            fqnResolver.registerGlobalFqn(modDescriptor);
            result.add(modDescriptor);
        }

        return result;
    }

}
