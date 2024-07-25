package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("Value")
public interface ValueDescriptor extends TypeScriptDescriptor {

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);


    @Relation.Incoming
    ValueArrayContainsDescriptor getParentArray();

    @Relation.Incoming
    ValueCallHasArgumentDescriptor getParentCall();

}
