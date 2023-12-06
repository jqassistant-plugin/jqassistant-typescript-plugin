package org.jqassistant.plugin.typescript.api.model.react;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("RENDERS")
public interface ReactComponentRendersDescriptor extends Descriptor {

    @Relation.Outgoing
    ReactComponentDescriptor getComponent();

    @Relation.Incoming
    JSXElementTypeDescriptor getJSXElementType();

    Integer getCardinality();
    void setCardinality(Integer cardinality);

}
