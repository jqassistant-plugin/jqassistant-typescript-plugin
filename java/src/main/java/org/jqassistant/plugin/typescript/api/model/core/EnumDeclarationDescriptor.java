package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Enum")
@TypeScript(TypeScript.TypeScriptElement.EnumDeclaration)
public interface EnumDeclarationDescriptor extends TypeScriptDescriptor, CodeCoordinateDescriptor, LocalGlobalFqnDescriptor {

    String getName();
    void setName(String name);

    Boolean getConstant();
    void setConstant(Boolean constant);

    Boolean getDeclared();
    void setDeclared(Boolean declared);

    @Relation("DECLARES")
    List<EnumMemberDescriptor> getMembers();
}
