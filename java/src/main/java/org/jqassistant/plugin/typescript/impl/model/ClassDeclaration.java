package org.jqassistant.plugin.typescript.impl.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class ClassDeclaration extends NamedConcept {

    private String className;

    @JsonAlias("abstract")
    private Boolean abstractt;

    private List<TypeParameterDeclaration> typeParameters = new ArrayList<>();

    private TypeDeclared extendsClass;

    private List<TypeDeclared> implementsInterfaces = new ArrayList<>();

    private ConstructorDeclaration constr;

    private List<PropertyDeclaration> properties = new ArrayList<>();

    private List<MethodDeclaration> methods = new ArrayList<>();

    private List<GetterDeclaration> getters = new ArrayList<>();

    private List<SetterDeclaration> setters = new ArrayList<>();

    private List<Decorator> decorators = new ArrayList<>();

    private CodeCoordinates coordinates;
}
