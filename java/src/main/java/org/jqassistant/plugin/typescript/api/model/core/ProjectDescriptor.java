package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Project")
public interface ProjectDescriptor extends TypeScriptDescriptor {

    @Relation("HAS_ROOT")
    DirectoryDescriptor getRootDirectory();
    void setRootDirectory(DirectoryDescriptor rootDirectory);

    @Relation("HAS_CONFIG")
    FileDescriptor getConfigFile();
    void setConfigFile(FileDescriptor configFile);

    @Relation("CONTAINS")
    List<ModuleDescriptor> getModules();

    @Relation("USES")
    List<ExternalModuleDescriptor> getExternalModules();

    @Relation
    List<ProjectDescriptor> getReferencedProjects();

}
