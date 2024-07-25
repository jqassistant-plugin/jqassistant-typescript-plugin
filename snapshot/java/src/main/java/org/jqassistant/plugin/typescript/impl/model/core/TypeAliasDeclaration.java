package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class TypeAliasDeclaration extends NamedConcept {

    private String typeAliasName;

    private List<TypeParameterDeclaration> typeParameters = new ArrayList<>();

    private Type type;

    private CodeCoordinates coordinates;

}
