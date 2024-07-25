package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("HAS_ARGUMENT")
public interface ValueCallHasArgumentDescriptor extends Descriptor {

    @Relation.Outgoing
    ValueCallDescriptor getCall();

    @Relation.Incoming
    ValueDescriptor getArgument();

    Integer getIndex();
    void setIndex(Integer index);

}
