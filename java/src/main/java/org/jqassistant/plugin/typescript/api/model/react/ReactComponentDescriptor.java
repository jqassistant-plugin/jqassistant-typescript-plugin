package org.jqassistant.plugin.typescript.api.model.react;

import com.buschmais.xo.neo4j.api.annotation.Label;
import org.jqassistant.plugin.typescript.api.model.core.NamedConceptDescriptor;

@Label("ReactComponent")
public interface ReactComponentDescriptor extends NamedConceptDescriptor {

    String getName();
    void setName(String name);

    Boolean getClassComponent();
    void setClassComponent(Boolean classComponent);

}
