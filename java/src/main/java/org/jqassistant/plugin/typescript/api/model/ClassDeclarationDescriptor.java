package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;

@Label("Class")
public interface ClassDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

    String getClassName();
    void setClassName(String className);

    Boolean getAbstract();
    void setAbstract(Boolean abstractt);

}
