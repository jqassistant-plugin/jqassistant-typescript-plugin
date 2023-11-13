package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Call")
public interface ValueCallDescriptor extends ValueDescriptor {

    @Relation.Outgoing
    List<ValueCallHasArgumentDescriptor> getArguments();

    @Relation.Outgoing
    List<ValueCallHasTypeArgumentDescriptor> getTypeArguments();

}
