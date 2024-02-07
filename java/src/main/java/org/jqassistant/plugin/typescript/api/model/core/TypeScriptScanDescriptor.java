package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Scan")
public interface TypeScriptScanDescriptor extends TypeScriptDescriptor, FileDescriptor {

    @Relation("CONTAINS_PROJECT")
    List<ProjectDescriptor> getProjects();

}
