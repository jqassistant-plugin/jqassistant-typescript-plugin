package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class TypeDeclared extends Type {

    private String fqn;

    private List<Type> typeArguments = new ArrayList<>();

}
