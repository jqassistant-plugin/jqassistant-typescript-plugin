package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Function")
public interface ValueFunctionDescriptor extends ValueDescriptor {

    Boolean getArrowFunction();
    void setArrowFunction(Boolean arrowFunction);

}
