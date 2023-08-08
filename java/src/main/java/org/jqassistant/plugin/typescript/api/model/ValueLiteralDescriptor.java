package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Literal")
public interface ValueLiteralDescriptor extends ValueDescriptor {

    Object getValue();
    void setValue(Object value);

}
