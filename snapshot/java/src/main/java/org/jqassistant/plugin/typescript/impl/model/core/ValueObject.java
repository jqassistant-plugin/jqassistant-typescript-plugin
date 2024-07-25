package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@ToString
public class ValueObject extends Value {

    private Map<String, Value> members = new HashMap<>();

}
