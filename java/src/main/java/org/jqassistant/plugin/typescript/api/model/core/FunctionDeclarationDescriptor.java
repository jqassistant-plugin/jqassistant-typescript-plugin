package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Function")
@TypeScript(TypeScript.TypeScriptElement.FunctionDeclaration)
public interface FunctionDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

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
