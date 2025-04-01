package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("TypeAlias")
@TypeScript(TypeScript.TypeScriptElement.TypeAliasDeclaration)
public interface TypeAliasDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

    @Relation("DECLARES")
    List<TypeParameterDeclarationDescriptor> getTypeParameters();

}
