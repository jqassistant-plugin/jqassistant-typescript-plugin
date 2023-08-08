package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class EnumDeclaration extends NamedConcept {

    private String enumName;

    private Boolean constant;

    private Boolean declared;

    private CodeCoordinates coordinates;

    private List<EnumMember> members = new ArrayList<>();

}
