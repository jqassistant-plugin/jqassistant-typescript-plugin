package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

@Label("Variable")
@TypeScript(TypeScript.TypeScriptElement.VariableDeclaration)
public interface VariableDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    String getKind();
    void setKind(String kind);

    @Relation("OF_TYPE")
    TypeDescriptor getType();
    void setType(TypeDescriptor type);

    @Relation("INITIALIZED_WITH")
    ValueDescriptor getInitValue();
    void setInitValue(ValueDescriptor initValue);

}
