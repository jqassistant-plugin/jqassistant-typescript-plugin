package org.jqassistant.plugin.typescript.api.model.react;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.model.core.GlobalFqnDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptDescriptor;

import java.util.List;

@Label("JSXElementType")
public interface JSXElementTypeDescriptor extends GlobalFqnDescriptor, TypeScriptDescriptor {

    String getName();
    void setName(String name);

    @Relation("REFERENCES")
    TypeScriptDescriptor getReference();
    void setReference(TypeScriptDescriptor reference);

    @Relation.Incoming
    List<ReactComponentRendersDescriptor> getRenderingComponents();

}
