package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("ObjectMember")
public interface ValueObjectMemberDescriptor extends ValueDescriptor {

    String getName();
    void setName(String name);

    @Relation("REFERENCES")
    ValueDescriptor getReference();
    void setReference(ValueDescriptor reference);

}
