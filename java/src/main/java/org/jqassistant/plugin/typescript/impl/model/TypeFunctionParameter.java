package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TypeFunctionParameter {

    private Integer index;

    private String name;

    private Boolean optional;

    private Type type;

}
