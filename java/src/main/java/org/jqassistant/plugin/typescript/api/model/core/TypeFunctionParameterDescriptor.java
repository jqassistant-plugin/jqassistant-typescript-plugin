package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("FunctionParameter")
public interface TypeFunctionParameterDescriptor extends TypeDescriptor {

    Integer getIndex();
    void setIndex(Integer index);

    String getName();
    void setName(String name);

    Boolean getOptional();
    void setOptional(Boolean optional);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

}
