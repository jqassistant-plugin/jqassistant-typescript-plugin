package org.jqassistant.plugin.typescript.impl.model.react;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.jqassistant.plugin.typescript.impl.model.core.NamedConcept;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class ReactComponent extends NamedConcept {

    private String componentName;

    private List<JSXDependency> renderedElements = new ArrayList<>();

}
