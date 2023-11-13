package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class VariableDeclaration extends NamedConcept {

    private String variableName;

    private String kind;

    private Type type;

    private Value initValue;

    private CodeCoordinates coordinates;

}
