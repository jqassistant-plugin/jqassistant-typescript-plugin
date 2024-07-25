package org.jqassistant.plugin.typescript.api.model.react;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.model.core.LocalGlobalFqnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;

import java.util.List;

@Label("ReactComponent")
public interface ReactComponentDescriptor extends LocalGlobalFqnDescriptor, TypeScriptDescriptor {

    String getComponentName();
    void setComponentName(String componentName);

    @Relation.Outgoing
    List<ReactComponentRendersDescriptor> getRenderedElements();

}
