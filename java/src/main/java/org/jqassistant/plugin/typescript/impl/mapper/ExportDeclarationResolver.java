package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.ModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.ModuleExportsDescriptor;
import org.jqassistant.plugin.typescript.api.model.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.impl.model.ExportDeclaration;

import java.util.List;

public class ExportDeclarationResolver {

    public static void resolve(Scanner scanner, List<ExportDeclaration> exports) {
        ScannerContext context = scanner.getContext();
        FqnResolver fqnResolver = context.peek(FqnResolver.class);

        for(ExportDeclaration export : exports) {
            if(export.getKind().equals("namespace")) {
                continue; // TODO: implement re-exports
            }

            TypeScriptDescriptor module = fqnResolver.getByFqn(export.getSourceFilePath());
            TypeScriptDescriptor target = fqnResolver.getByFqn(export.getDeclFqn());
            if(target != null && module instanceof ModuleDescriptor) {
                ModuleExportsDescriptor relationDescriptor = context.getStore().create(module, ModuleExportsDescriptor.class, target);

                if(export.getAlias() != null) {
                    relationDescriptor.setExportedName(export.getAlias());
                } else {
                    relationDescriptor.setExportedName(export.getIdentifier());
                }

            }
        }
    }

}
