package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.xo.neo4j.api.annotation.Label;
import com.buschmais.xo.neo4j.api.annotation.Relation;
import org.jqassistant.plugin.typescript.api.report.TypeScript;

import java.util.List;

@Label("Constructor")
@TypeScript(TypeScript.TypeScriptElement.ConstructorDeclaration)
public interface ConstructorDeclarationDescriptor extends TypeScriptDescriptor, LocalGlobalFqnDescriptor, CodeCoordinateDescriptor {

    @Relation("HAS")
    List<ParameterDeclarationDescriptor> getParameters();

}
