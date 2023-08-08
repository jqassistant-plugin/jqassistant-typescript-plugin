package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("Variable")
public interface VariableDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    String getKind();
    void setKind(String kind);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

    @Relation("INITIALIZED_WITH")
    ValueDescriptor getInitValue();
    void setInitValue(ValueDescriptor initValue);

}
