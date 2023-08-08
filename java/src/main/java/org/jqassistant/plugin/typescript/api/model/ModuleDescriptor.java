package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Module")
public interface ModuleDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor {

    @Relation("DECLARES")
    List<TypeAliasDeclarationDescriptor> getTypeAliasDeclarations();

    @Relation("DECLARES")
    List<ClassDeclarationDescriptor> getClassDeclarations();

    @Relation("DECLARES")
    List<InterfaceDeclarationDescriptor> getInterfaceDeclarations();

    @Relation("DECLARES")
    List<EnumDeclarationDescriptor> getEnumDeclarations();

    @Relation("DECLARES")
    List<FunctionDeclarationDescriptor> getFunctionDeclarations();

    @Relation("DECLARES")
    List<VariableDeclarationDescriptor> getVariableDeclarations();

}
