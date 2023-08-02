package org.jqassistant.plugin.typescript.impl.model;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class ValueCall extends Value {

    private Value callee;

    private List<Value> args = new ArrayList<>();

    private List<Type> typeArgs = new ArrayList<>();

}
