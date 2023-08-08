package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Object")
public interface ValueObjectDescriptor extends ValueDescriptor {

    @Relation("HAS_MEMBER")
    List<ValueObjectMemberDescriptor> getMembers();

}
