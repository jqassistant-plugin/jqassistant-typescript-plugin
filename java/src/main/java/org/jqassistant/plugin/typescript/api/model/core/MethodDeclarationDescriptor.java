package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Method")
@TypeScript(TypeScript.TypeScriptElement.MethodDeclaration)
public interface MethodDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    String getVisibility();
    void setVisibility(String visibility);

    Boolean getAsync();
    void setAsync(Boolean async);

    Boolean getStatic();
    void setStatic(Boolean staticc);

    Boolean getAbstract();
    void setAbstract(Boolean abstractt);

    Boolean getOverride();
    void setOverride(Boolean override);

    @Relation("DECLARES")
    List<TypeParameterDeclarationDescriptor> getTypeParameters();

    @Relation("HAS")
    List<ParameterDeclarationDescriptor> getParameters();

    @Relation("RETURNS")
    TypeDescriptor getReturnType();
    void setReturnType(TypeDescriptor returnType);

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();

}
