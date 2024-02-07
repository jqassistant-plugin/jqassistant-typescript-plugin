package org.jqassistant.plugin.typescript.impl.mapper.core;

import lombok.extern.slf4j.Slf4j;
import org.jqassistant.plugin.typescript.api.model.core.GlobalFqnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeDeclaredDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ValueDeclaredDescriptor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class FqnResolver {

    private final Map<String, GlobalFqnDescriptor> namedConcepts = new HashMap<>();

    private final List<TypeDeclaredDescriptor> typeDeclaredListToResolve = new ArrayList<>();
    private final List<ValueDeclaredDescriptor> valueDeclaredListToResolve = new ArrayList<>();


    public void registerRef(TypeDeclaredDescriptor descriptor) {
        typeDeclaredListToResolve.add(descriptor);
    }

    public void registerRef(ValueDeclaredDescriptor descriptor) {
        valueDeclaredListToResolve.add(descriptor);
    }


    public void resolveAll() {
        for(TypeDeclaredDescriptor descriptor : typeDeclaredListToResolve) {
            descriptor.setReference(getByGlobalFqn(descriptor.getReferencedGlobalFqn()));
        }

        for(ValueDeclaredDescriptor descriptor : valueDeclaredListToResolve) {
            descriptor.setReference(getByGlobalFqn(descriptor.getReferencedGlobalFqn()));
        }
    }


    public void registerGlobalFqn(GlobalFqnDescriptor concept) {
        if(namedConcepts.containsKey(concept.getGlobalFqn())) {
            log.warn("Language concept with global fully qualified name \"" + concept.getGlobalFqn() + "\" already exists!");
            return;
        }
        namedConcepts.put(concept.getGlobalFqn(), concept);
    }

    public TypeScriptDescriptor getByGlobalFqn(String fqn) {
        if(namedConcepts.containsKey(fqn)) {
            return (TypeScriptDescriptor) namedConcepts.get(fqn);
        } else {
            return null;
        }
    }

    public void logAll() {
        namedConcepts.keySet().forEach(log::info);
        log.info("Total registered FQNs: " + namedConcepts.keySet().size());
    }
}
