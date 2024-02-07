package org.jqassistant.plugin.typescript.impl.mapper.react;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.core.store.api.Store;
import org.jqassistant.plugin.typescript.api.model.core.LocalGlobalFqnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.api.model.react.JSXElementTypeDescriptor;
import org.jqassistant.plugin.typescript.api.model.react.ReactComponentDescriptor;
import org.jqassistant.plugin.typescript.api.model.react.ReactComponentRendersDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.core.FqnResolver;
import org.jqassistant.plugin.typescript.impl.model.react.JSXDependency;
import org.jqassistant.plugin.typescript.impl.model.react.ReactComponent;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReactComponentResolver {

    public static void resolve(Scanner scanner, List<ReactComponent> reactComponents) {
        ScannerContext context = scanner.getContext();
        Store store = scanner.getContext().getStore();
        FqnResolver fqnResolver = context.peek(FqnResolver.class);

        Map<String, JSXElementTypeDescriptor> elementTypeDescriptors = new HashMap<>();
        for(ReactComponent component : reactComponents) {
            TypeScriptDescriptor target = fqnResolver.getByGlobalFqn(component.getGlobalFqn());
            if(target instanceof LocalGlobalFqnDescriptor) {
                ReactComponentDescriptor componentDescriptor = store.addDescriptorType(target, ReactComponentDescriptor.class);
                componentDescriptor.setComponentName(component.getComponentName());

                for(JSXDependency jsxDep : component.getRenderedElements()) {
                    var elementTypeDescriptor = elementTypeDescriptors.computeIfAbsent(jsxDep.getGlobalFqn(), (key) -> {
                        var elementType = store.create(JSXElementTypeDescriptor.class);
                        elementType.setGlobalFqn(jsxDep.getGlobalFqn());
                        elementType.setName(jsxDep.getName());
                        var referenceDescriptor = fqnResolver.getByGlobalFqn(jsxDep.getGlobalFqn());
                        if(referenceDescriptor != null) {
                            elementType.setReference(referenceDescriptor);
                        }
                        return elementType;
                    });

                    var rendersRelation = store.create(componentDescriptor, ReactComponentRendersDescriptor.class, elementTypeDescriptor);
                    rendersRelation.setCardinality(jsxDep.getCardinality());
                }
            }
        }
    }

}
