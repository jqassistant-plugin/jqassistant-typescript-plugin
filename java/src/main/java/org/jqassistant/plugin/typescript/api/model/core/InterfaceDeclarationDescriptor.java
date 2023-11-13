package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Interface")
public interface InterfaceDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

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
