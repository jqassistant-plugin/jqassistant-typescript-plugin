package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Literal")
public interface TypeLiteralDescriptor extends TypeDescriptor {

    Object getValue();
    void setValue(Object value);

}
