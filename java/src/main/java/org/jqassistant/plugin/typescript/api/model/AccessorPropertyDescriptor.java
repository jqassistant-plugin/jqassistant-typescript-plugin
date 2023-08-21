package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Label("AccessorProperty")
public interface AccessorPropertyDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor {

    String getName();
    void setName(String name);

    @Relation("DESCRIBED_BY")
    GetterDeclarationDescriptor getGetter();
    void setGetter(GetterDeclarationDescriptor getter);

    @Relation("DESCRIBED_BY")
    SetterDeclarationDescriptor getSetter();
    void setSetter(SetterDeclarationDescriptor setter);

    @Relation("DESCRIBED_BY")
    AutoAccessorDeclarationDescriptor getAutoAccessor();
    void setAutoAccessor(AutoAccessorDeclarationDescriptor autoAccessor);

}
