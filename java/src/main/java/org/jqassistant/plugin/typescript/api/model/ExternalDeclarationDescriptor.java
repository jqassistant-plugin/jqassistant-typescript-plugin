package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("ExternalDeclaration")
public interface ExternalDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor {

    String getName();
    void setName(String name);

}
