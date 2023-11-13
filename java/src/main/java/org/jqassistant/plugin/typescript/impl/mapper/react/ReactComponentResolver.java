package org.jqassistant.plugin.typescript.impl.mapper.react;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.core.NamedConceptDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.core.FqnResolver;
import org.jqassistant.plugin.typescript.impl.model.react.ReactComponent;

import java.util.List;

public class ReactComponentResolver {

    public static void resolve(Scanner scanner, List<ReactComponent> reactComponents) {
        ScannerContext context = scanner.getContext();
        FqnResolver fqnResolver = context.peek(FqnResolver.class);

        for(ReactComponent component : reactComponents) {
            TypeScriptDescriptor target = fqnResolver.getByFqn(component.getFqn());
            if(target != null && target instanceof NamedConceptDescriptor) {
                // TODO: label existing nodes and add properties
            }
        }
    }

}
