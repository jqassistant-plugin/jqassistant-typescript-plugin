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
public class MethodDeclaration extends NamedConcept {

    private String methodName;

    private List<ParameterDeclaration> parameters = new ArrayList<>();

    private Type returnType;

    private List<TypeParameterDeclaration> typeParameters = new ArrayList<>();

    private List<Decorator> decorators = new ArrayList<>();

    private String visibility;

    private CodeCoordinates coordinates;

    private Boolean override;

    @JsonAlias("abstract")
    private Boolean abstractt;

    @JsonAlias("isStatic")
    private Boolean staticc;

}
