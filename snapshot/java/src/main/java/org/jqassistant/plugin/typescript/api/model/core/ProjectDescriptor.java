package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Project")
public interface ProjectDescriptor extends TypeScriptDescriptor {

    @Relation("HAS_ROOT")
    LocalFileDescriptor getRootDirectory();
    void setRootDirectory(LocalFileDescriptor rootDirectory);

    @Relation("HAS_CONFIG")
    LocalFileDescriptor getConfigFile();
    void setConfigFile(LocalFileDescriptor configFile);

    @Relation("CONTAINS")
    List<ModuleDescriptor> getModules();

    @Relation("USES")
    List<ExternalModuleDescriptor> getExternalModules();

    @Relation
    List<ProjectDescriptor> getReferencedProjects();

}
