package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("CONTAINS")
public interface TypeTupleContainsDescriptor extends Descriptor {

    @Relation.Outgoing
    TypeTupleDescriptor getParentTuple();

    @Relation.Incoming
    TypeDescriptor getItem();

    Integer getIndex();
    void setIndex(Integer index);

}
