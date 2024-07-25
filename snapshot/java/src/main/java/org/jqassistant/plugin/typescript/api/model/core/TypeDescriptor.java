package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("Type")
public interface TypeDescriptor extends TypeScriptDescriptor {

    @Relation.Incoming
    TypeTupleContainsDescriptor getParentTuple();

    @Relation.Incoming
    TypeDeclaredHasTypeArgumentDescriptor getParentDeclaredType();

    @Relation.Incoming
    ValueCallHasTypeArgumentDescriptor getParentValueCall();

}
