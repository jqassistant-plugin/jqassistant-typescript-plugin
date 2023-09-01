package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Function")
public interface FunctionDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    Boolean getAsync();
    void setAsync(Boolean async);

    @Relation("RETURNS")
    TypeDescriptor getReturnType();
    void setReturnType(TypeDescriptor returnType);

    @Relation("HAS_PARAMETER")
    List<ParameterDeclarationDescriptor> getParameters();

    @Relation("DECLARES")
    List<TypeParameterDeclarationDescriptor> getTypeParameters();

}
