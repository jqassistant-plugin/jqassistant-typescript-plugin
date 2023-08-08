package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Primitive")
public interface TypePrimitiveDescriptor extends TypeDescriptor {

    String getName();
    void setName(String name);

}
