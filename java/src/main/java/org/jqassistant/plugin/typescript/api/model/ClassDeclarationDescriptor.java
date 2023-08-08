package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Class")
public interface ClassDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    Boolean getAbstract();
    void setAbstract(Boolean abstractt);

    @Relation("DECLARES")
    List<TypeParameterDeclarationDescriptor> getTypeParameters();

    @Relation("EXTENDS")
    TypeDeclaredDescriptor getExtendsClass();
    void setExtendsClass(TypeDeclaredDescriptor extendsClass);

    @Relation("IMPLEMENTS")
    List<TypeDeclaredDescriptor> getImplementsInterfaces();

    @Relation("DECLARES")
    List<PropertyDeclarationDescriptor> getProperties();

    @Relation("DECLARES")
    ConstructorDeclarationDescriptor getConstructor();
    void setConstructor(ConstructorDeclarationDescriptor constructor);

    @Relation("DECLARES")
    List<MethodDeclarationDescriptor> getMethods();

    @Relation("DECLARES")
    List<GetterDeclarationDescriptor> getGetters();

    @Relation("DECLARES")
    List<SetterDeclarationDescriptor> getSetters();

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();

}
