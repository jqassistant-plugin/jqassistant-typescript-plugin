package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("EXPORTS")
public interface ModuleExportsDescriptor extends Descriptor {

    @Relation.Incoming
    TypeScriptDescriptor getExportedDeclaration();

    @Relation.Outgoing
    ModuleDescriptor getExportingModule();

    String getExportedName();
    void setExportedName(String exportedName);

}
