package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class Dependency extends NamedConcept {

    private String targetType;

    private String globalSourceFQN;

    private String sourceType;

    private Integer cardinality;

}
