package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("HAS_TYPE_ARGUMENT")
public interface TypeDeclaredHasTypeArgumentDescriptor extends Descriptor {

    @Relation.Outgoing
    TypeDeclaredDescriptor getTypeDeclared();

    @Relation.Incoming
    TypeDescriptor getTypeArgument();

    Integer getIndex();
    void setIndex(Integer index);

}
