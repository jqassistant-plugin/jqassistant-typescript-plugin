package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("ObjectMember")
public interface TypeObjectMemberDescriptor extends TypeDescriptor {
    String getName();
    void setName(String name);

    Boolean getOptional();
    void setOptional(Boolean optional);

    Boolean getReadonly();
    void setReadonly(Boolean readonly);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

}
