package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("NotIdentified")
public interface TypeNotIdentifiedDescriptor extends TypeDescriptor{

    String getIdentifier();
    void setIdentifier(String identifier);

}
