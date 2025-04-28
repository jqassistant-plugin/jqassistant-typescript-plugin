package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Module")
@TypeScript(TypeScript.TypeScriptElement.Module)
public interface ModuleDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor {

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

    @Relation.Outgoing
    List<ModuleExportsDescriptor> getExportedDeclarations();

}
