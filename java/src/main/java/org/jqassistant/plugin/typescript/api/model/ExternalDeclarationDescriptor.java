package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("ExternalDeclaration")
public interface ExternalDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor {

    @Relation.Incoming
    List<ExternalModuleExportsDescriptor> getExportingExternalModules();

}
