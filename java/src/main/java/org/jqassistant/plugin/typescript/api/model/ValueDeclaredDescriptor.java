package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("Declared")
public interface ValueDeclaredDescriptor extends ValueDescriptor {

    String getReferencedFqn();
    void setReferencedFqn(String referencedFqn);

    Boolean getInternal();
    void setInternal(Boolean internal);

    @Relation("REFERENCES")
    TypeScriptDescriptor getReference();
    void setReference(TypeScriptDescriptor reference);

}
