package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import lombok.extern.slf4j.Slf4j;
import org.jqassistant.plugin.typescript.api.model.core.ModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ModuleExportsDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.ExportDeclaration;

import java.util.List;

@Slf4j
public class ExportDeclarationResolver {

    public static void resolve(Scanner scanner, List<ExportDeclaration> exports) {
        ScannerContext context = scanner.getContext();
        FqnResolver fqnResolver = context.peek(FqnResolver.class);

        for(ExportDeclaration export : exports) {
            if(export.getKind().equals("namespace")) {
                log.warn("Export Declaration of type 'namespace' should not be part of the report!");
                continue;
            }

            TypeScriptDescriptor module = fqnResolver.getByGlobalFqn(export.getSourceFilePathAbsolute());
            TypeScriptDescriptor target = fqnResolver.getByGlobalFqn(export.getGlobalDeclFqn());
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
