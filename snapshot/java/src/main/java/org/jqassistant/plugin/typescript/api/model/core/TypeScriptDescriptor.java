package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.core.store.api.model.Descriptor;
import com.buschmais.xo.api.annotation.Abstract;
import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Abstract
@Label("TS")
public interface TypeScriptDescriptor extends Descriptor {

    @Relation.Incoming
    List<DependsOnDescriptor> getDependents();

    @Relation.Outgoing
    List<DependsOnDescriptor> getDependencies();

    @Relation.Incoming
    List<ModuleExportsDescriptor> getExporters();

}
