package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("Decorator")
public interface DecoratorDescriptor extends TypeScriptDescriptor, CodeCoordinateDescriptor {

    @Relation("HAS_VALUE")
    ValueDescriptor getValue();
    void setValue(ValueDescriptor value);

}
