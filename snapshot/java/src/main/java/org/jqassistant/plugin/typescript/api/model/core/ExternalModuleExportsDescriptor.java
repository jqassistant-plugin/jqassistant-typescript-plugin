package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.neo4j.api.annotation.Relation;

@Relation("EXPORTS")
public interface ExternalModuleExportsDescriptor extends Descriptor {

    @Relation.Incoming
    ExternalDeclarationDescriptor getExportedDeclaration();

    @Relation.Outgoing
    ExternalModuleDescriptor getExportingModule();

    String getExportedName();
    void setExportedName(String exportedName);

}
