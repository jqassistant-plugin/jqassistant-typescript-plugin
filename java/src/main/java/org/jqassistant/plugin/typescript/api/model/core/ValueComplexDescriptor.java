package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Complex")
public interface ValueComplexDescriptor extends ValueDescriptor {

    String getExpression();
    void setExpression(String expression);

}
