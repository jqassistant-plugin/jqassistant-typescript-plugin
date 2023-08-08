package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Getter")
public interface GetterDeclarationDescriptor extends TypeScriptDescriptor, NamedConceptDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    String getVisibility();
    void setVisibility(String visibility);

    Boolean getStatic();
    void setStatic(Boolean staticc);

    Boolean getAbstract();
    void setAbstract(Boolean abstractt);

    Boolean getOverride();
    void setOverride(Boolean override);

    @Relation("RETURNS")
    TypeDescriptor getReturnType();
    void setReturnType(TypeDescriptor returnType);

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();

}
