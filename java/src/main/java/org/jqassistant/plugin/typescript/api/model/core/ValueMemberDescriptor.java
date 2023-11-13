package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("Member")
public interface ValueMemberDescriptor extends ValueDescriptor {

    @Relation("PARENT")
    ValueDescriptor getParent();
    void setParent(ValueDescriptor parent);

    @Relation("MEMBER")
    ValueDescriptor getMember();
    void setMember(ValueDescriptor member);

}
