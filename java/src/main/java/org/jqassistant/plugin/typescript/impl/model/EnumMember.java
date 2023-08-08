package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class EnumMember extends NamedConcept {

    private String enumMemberName;

    private Value initValue;

    private CodeCoordinates coordinates;

}
