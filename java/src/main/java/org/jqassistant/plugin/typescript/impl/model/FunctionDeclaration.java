package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class FunctionDeclaration extends NamedConcept {

    private String functionName;

    private List<ParameterDeclaration> parameters = new ArrayList<>();

    private Type returnType;

    private List<TypeParameterDeclaration> typeParameters = new ArrayList<>();

    private CodeCoordinates coordinates;

}
