package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class ConstructorDeclaration extends NamedConcept {

    private List<ParameterDeclaration> parameters = new ArrayList<>();

    private List<ParameterPropertyDeclaration> parameterProperties = new ArrayList<>();

    private CodeCoordinates coordinates;

}
