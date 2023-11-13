package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TypeObjectMember {

    private String name;

    private Type type;

    private Boolean optional;

    private Boolean readonly;

}
