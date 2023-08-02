package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Module")
public interface ModuleDescriptor extends TypeScriptDescriptor {

    @Relation("DECLARES")
    List<ClassDeclarationDescriptor> getClassDeclarations();
}
