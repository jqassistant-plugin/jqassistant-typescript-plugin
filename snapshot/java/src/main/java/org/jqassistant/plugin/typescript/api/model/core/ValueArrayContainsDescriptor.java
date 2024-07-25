package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("CONTAINS")
public interface ValueArrayContainsDescriptor extends Descriptor {

    @Relation.Outgoing
    ValueArrayDescriptor getParentArray();

    @Relation.Incoming
    ValueDescriptor getItem();

    Integer getIndex();
    void setIndex(Integer index);

}
