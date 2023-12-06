package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("DEPENDS_ON")
public interface DependsOnDescriptor extends Descriptor {

    @Relation.Incoming
    TypeScriptDescriptor getDependency();

    @Relation.Outgoing
    TypeScriptDescriptor getDependent();

    Integer getCardinality();
    void setCardinality(Integer cardinality);

}
