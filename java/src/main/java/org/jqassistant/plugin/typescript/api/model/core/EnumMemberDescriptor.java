package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("EnumMember")
public interface EnumMemberDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    @Relation("INITIALIZED_WITH")
    ValueDescriptor getInitValue();
    void setInitValue(ValueDescriptor initValue);

}
