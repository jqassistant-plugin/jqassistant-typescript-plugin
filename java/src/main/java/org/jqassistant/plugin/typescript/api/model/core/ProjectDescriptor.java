package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Project")
public interface ProjectDescriptor extends TypeScriptDescriptor, DirectoryDescriptor {

    @Relation("CONTAINS")
    List<ModuleDescriptor> getModules();

    @Relation("REFERENCES")
    List<ExternalModuleDescriptor> getExternalModules();

}
