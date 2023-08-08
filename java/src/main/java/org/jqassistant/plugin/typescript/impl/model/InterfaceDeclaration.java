package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class InterfaceDeclaration extends NamedConcept {

    private String interfaceName;

    private List<TypeParameterDeclaration> typeParameters = new ArrayList<>();

    private List<TypeDeclared> extendsInterfaces = new ArrayList<>();

    private List<PropertyDeclaration> properties = new ArrayList<>();

    private List<MethodDeclaration> methods = new ArrayList<>();

    private List<GetterDeclaration> getters = new ArrayList<>();

    private List<SetterDeclaration> setters = new ArrayList<>();

    private CodeCoordinates coordinates;

}
