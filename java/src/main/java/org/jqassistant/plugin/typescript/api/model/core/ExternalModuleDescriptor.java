package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("ExternalModule")
public interface ExternalModuleDescriptor extends TypeScriptDescriptor, GlobalFqnDescriptor {

    @Relation.Outgoing
    List<ExternalModuleExportsDescriptor> getExportedDeclarations();

}
