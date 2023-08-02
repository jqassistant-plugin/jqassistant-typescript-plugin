package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class TypeFunction extends Type {

    private Type returnType;

    private List<TypeFunctionParameter> parameters = new ArrayList<>();

    private List<TypeParameterDeclaration> typeParameters = new ArrayList<>();

}
