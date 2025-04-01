package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Class")
@TypeScript(TypeScript.TypeScriptElement.ClassDeclaration)
public interface ClassDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

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
    List<AccessorPropertyDescriptor> getAccessorProperties();

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();

}
