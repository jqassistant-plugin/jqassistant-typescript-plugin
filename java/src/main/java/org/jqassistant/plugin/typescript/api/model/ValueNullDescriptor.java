package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Null")
public interface ValueNullDescriptor extends ValueDescriptor {

    String getKind();
    void setKind(String kind);

}
