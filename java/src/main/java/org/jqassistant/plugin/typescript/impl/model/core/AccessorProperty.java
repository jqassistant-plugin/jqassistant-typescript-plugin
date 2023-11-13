package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AccessorProperty extends NamedConcept {

    private String accessorName;

    private GetterDeclaration getter;

    private SetterDeclaration setter;

    private AutoAccessorDeclaration autoAccessor;

}
