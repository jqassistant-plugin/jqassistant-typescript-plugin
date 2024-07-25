package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TypeParameterDeclaration {

    private String name;

    private Integer index;

    private Type constraint;

}
