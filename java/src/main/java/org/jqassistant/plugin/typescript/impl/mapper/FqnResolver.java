package org.jqassistant.plugin.typescript.impl.mapper;

import lombok.extern.slf4j.Slf4j;
import org.jqassistant.plugin.typescript.api.model.NamedConceptDescriptor;
import org.jqassistant.plugin.typescript.api.model.TypeDeclaredDescriptor;
import org.jqassistant.plugin.typescript.api.model.TypeScriptDescriptor;
import org.jqassistant.plugin.typescript.api.model.ValueDeclaredDescriptor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
public class FqnResolver {

    private final Map<String, NamedConceptDescriptor> namedConcepts = new HashMap<>();

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
            descriptor.setReference(getByFqn(descriptor.getReferencedFqn()));
        }

        for(ValueDeclaredDescriptor descriptor : valueDeclaredListToResolve) {
            descriptor.setReference(getByFqn(descriptor.getReferencedFqn()));
        }
    }


    public void registerFqn(NamedConceptDescriptor concept) {
        if(namedConcepts.containsKey(concept.getFqn())) {
            log.warn("Language concept with fully qualified name \"" + concept.getFqn() + "\" already exists!");
            return;
        }
        namedConcepts.put(concept.getFqn(), concept);
    }

    public TypeScriptDescriptor getByFqn(String fqn) {
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
