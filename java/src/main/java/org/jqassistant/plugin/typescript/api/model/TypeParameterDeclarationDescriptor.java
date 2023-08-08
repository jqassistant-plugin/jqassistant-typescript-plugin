package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("TypeParameter")
public interface TypeParameterDeclarationDescriptor extends TypeScriptDescriptor {

    String getName();
    void setName(String name);

    Integer getIndex();
    void setIndex(Integer index);

    @Relation("CONSTRAINED_BY")
    TypeDescriptor getConstraint();
    void setConstraint(TypeDescriptor typeDescriptor);

}
