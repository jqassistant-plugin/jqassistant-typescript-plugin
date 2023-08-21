package org.jqassistant.plugin.typescript.api.model;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("AutoAccessor")
public interface AutoAccessorDeclarationDescriptor extends TypeScriptDescriptor, CodeCoordinateDescriptor {

    String getVisibility();
    void setVisibility(String visibility);

    Boolean getStatic();
    void setStatic(Boolean staticc);

    Boolean getAbstract();
    void setAbstract(Boolean abstractt);

    Boolean getOverride();
    void setOverride(Boolean override);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();

}
