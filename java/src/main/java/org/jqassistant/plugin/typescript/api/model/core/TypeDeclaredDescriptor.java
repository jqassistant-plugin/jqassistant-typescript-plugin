package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Declared")
public interface TypeDeclaredDescriptor extends TypeDescriptor {

    String getReferencedFqn();
    void setReferencedFqn(String referencedFqn);

    @Relation.Outgoing
    List<TypeDeclaredHasTypeArgumentDescriptor> getTypeArguments();

    @Relation("REFERENCES")
    TypeScriptDescriptor getReference();
    void setReference(TypeScriptDescriptor reference);

}
