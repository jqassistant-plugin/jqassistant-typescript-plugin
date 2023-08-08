package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Parameter")
public interface ParameterDeclarationDescriptor extends TypeScriptDescriptor, CodeCoordinateDescriptor {

    Integer getIndex();
    void setIndex(Integer index);

    String getName();
    void setName(String name);

    Boolean getOptional();
    void setOptional(Boolean optional);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

    @Relation("DECLARES")
    PropertyDeclarationDescriptor getParameterProperty();
    void setParameterProperty(PropertyDeclarationDescriptor parameterProperty);

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();
}
