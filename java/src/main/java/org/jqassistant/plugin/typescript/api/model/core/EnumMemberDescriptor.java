package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

@Label("EnumMember")
@TypeScript(TypeScript.TypeScriptElement.EnumMember)
public interface EnumMemberDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    String getName();
    void setName(String name);

    @Relation("INITIALIZED_WITH")
    ValueDescriptor getInitValue();
    void setInitValue(ValueDescriptor initValue);

}
