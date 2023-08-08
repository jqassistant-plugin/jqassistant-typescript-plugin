package org.jqassistant.plugin.typescript.impl.mapper;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.jqassistant.plugin.typescript.api.model.NamedConceptDescriptor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Slf4j
public class FqnResolver {

    private final Map<String, NamedConceptDescriptor> namedConcepts = new HashMap<>();

    private final List<ImmutablePair<String, Consumer<NamedConceptDescriptor>>> referencesToResolve = new ArrayList<>();


    public void registerNamedConcept(NamedConceptDescriptor concept) {
        if(concept.getFqn().contains(concept.getFqn())) {
            log.warn("Language concept with name \"" + concept.getFqn() + "\" already exists!");
            return;
        }
        namedConcepts.put(concept.getFqn(), concept);
    }

    public void addFqnReferenceToResolve(String fqn, Consumer<NamedConceptDescriptor> setter) {
        referencesToResolve.add(new ImmutablePair<>(fqn, setter));
    }

    // TODO: not usable for bidirectional/complex relations
    public void resolveAll() {
        for(ImmutablePair<String, Consumer<NamedConceptDescriptor>> pair : referencesToResolve) {
            if(namedConcepts.containsKey(pair.getKey())) {
                pair.getValue().accept(namedConcepts.get(pair.getKey()));
            }
        }
    }

}
