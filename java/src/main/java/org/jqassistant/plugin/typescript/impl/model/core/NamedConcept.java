package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public abstract class NamedConcept {

    private String localFqn;

    private String globalFqn;

}
