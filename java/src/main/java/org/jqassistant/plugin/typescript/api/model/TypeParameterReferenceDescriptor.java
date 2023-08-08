package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("TypeParameterReference")
public interface TypeParameterReferenceDescriptor extends TypeDescriptor {

    String getName();
    void setName(String name);

    @Relation("REFERENCES")
    TypeParameterDeclarationDescriptor getReference();
    void setReference(TypeParameterDeclarationDescriptor typeParameterDeclaration);

}
