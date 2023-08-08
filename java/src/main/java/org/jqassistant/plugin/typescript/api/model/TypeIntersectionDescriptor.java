package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Intersection")
public interface TypeIntersectionDescriptor extends TypeDescriptor {

    @Relation("CONTAINS")
    List<TypeDescriptor> getTypes();

}
