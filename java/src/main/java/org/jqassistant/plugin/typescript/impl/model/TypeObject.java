package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class TypeObject extends Type {

    private List<TypeObjectMember> members = new ArrayList<>();

}
