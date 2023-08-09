package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Project")
public interface ProjectDescriptor extends TypeScriptDescriptor {

    @Relation("CONTAINS")
    List<ModuleDescriptor> getModules();

    @Relation("REFERENCES")
    List<ExternalModuleDescriptor> getExternalModules();

}
