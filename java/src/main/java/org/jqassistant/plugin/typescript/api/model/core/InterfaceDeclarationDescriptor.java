package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Interface")
@TypeScript(TypeScript.TypeScriptElement.InterfaceDeclaration)
public interface InterfaceDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    @Relation("DECLARES")
    List<TypeParameterDeclarationDescriptor> getTypeParameters();

    @Relation("EXTENDS")
    List<TypeDeclaredDescriptor> getExtendsInterfaces();

    @Relation("DECLARES")
    List<PropertyDeclarationDescriptor> getProperties();

    @Relation("DECLARES")
    List<MethodDeclarationDescriptor> getMethods();

    @Relation("DECLARES")
    List<AccessorPropertyDescriptor> getAccessorProperties();

}
