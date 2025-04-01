package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Property")
@TypeScript(TypeScript.TypeScriptElement.PropertyDeclaration)
public interface PropertyDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    Boolean getOptional();
    void setOptional(Boolean optional);

    Boolean getReadonly();
    void setReadonly(Boolean readonly);

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
