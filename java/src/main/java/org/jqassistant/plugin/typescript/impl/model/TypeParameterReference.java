package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Reference to a previously declared type parameter (e.g. T)
 */
@Getter
@Setter
@ToString
public class TypeParameterReference extends Type {

    private String name;

}
