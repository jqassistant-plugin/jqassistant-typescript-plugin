package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Array")
public interface ValueArrayDescriptor extends ValueDescriptor {

    @Relation.Outgoing
    List<ValueArrayContainsDescriptor> getItems();

}
