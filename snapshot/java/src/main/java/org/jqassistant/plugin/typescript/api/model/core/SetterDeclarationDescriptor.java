package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;

import java.util.List;

@Label("Setter")
public interface SetterDeclarationDescriptor extends TypeScriptDescriptor, CodeCoordinateDescriptor {

    String getVisibility();
    void setVisibility(String visibility);

    Boolean getStatic();
    void setStatic(Boolean staticc);

    Boolean getAbstract();
    void setAbstract(Boolean abstractt);

    Boolean getOverride();
    void setOverride(Boolean override);

    @Relation("HAS")
    List<ParameterDeclarationDescriptor> getParameters();

    @Relation("DECORATED_BY")
    List<DecoratorDescriptor> getDecorators();

}
