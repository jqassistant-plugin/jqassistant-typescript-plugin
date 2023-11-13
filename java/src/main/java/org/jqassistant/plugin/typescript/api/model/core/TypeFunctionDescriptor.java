package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Function")
public interface TypeFunctionDescriptor extends TypeDescriptor {

    Boolean getAsync();
    void setAsync(Boolean async);

    @Relation("RETURNS")
    TypeDescriptor getReturnType();
    void setReturnType(TypeDescriptor returnType);

    @Relation("HAS_PARAMETER")
    List<TypeFunctionParameterDescriptor> getParameters();

    @Relation("DECLARES")
    List<TypeParameterDeclarationDescriptor> getTypeParameters();

}
