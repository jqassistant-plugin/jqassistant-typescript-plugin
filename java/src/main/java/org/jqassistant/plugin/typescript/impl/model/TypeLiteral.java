package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class TypeLiteral extends  Type {

    /**
     * This can either be a string, number or boolean
     */
    private Object value;

}
