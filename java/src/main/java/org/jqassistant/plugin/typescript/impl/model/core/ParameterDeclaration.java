package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class ParameterDeclaration {

    private Integer index;

    private String name;

    private Type type;

    private Boolean optional;

    private List<Decorator> decorators = new ArrayList<>();

    private CodeCoordinates coordinates;

}
