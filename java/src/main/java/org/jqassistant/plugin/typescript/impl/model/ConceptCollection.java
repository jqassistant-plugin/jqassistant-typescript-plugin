package org.jqassistant.plugin.typescript.impl.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.jqassistant.plugin.typescript.impl.model.core.Module;
import org.jqassistant.plugin.typescript.impl.model.core.*;
import org.jqassistant.plugin.typescript.impl.model.react.ReactComponent;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class ConceptCollection {

    @JsonAlias("module")
    private List<Module> modules = new ArrayList<>();

    @JsonAlias("type-alias-declaration")
    private List<TypeAliasDeclaration> typeAliasDeclarations = new ArrayList<>();

    @JsonAlias("class-declaration")
    private List<ClassDeclaration> classDeclarations = new ArrayList<>();

    @JsonAlias("interface-declaration")
    private List<InterfaceDeclaration> interfaceDeclarations = new ArrayList<>();

    @JsonAlias("enum-declaration")
    private List<EnumDeclaration> enumDeclarations = new ArrayList<>();

    @JsonAlias("function-declaration")
    private List<FunctionDeclaration> functionDeclarations = new ArrayList<>();

    @JsonAlias("variable-declaration")
    private List<VariableDeclaration> variableDeclarations = new ArrayList<>();

    @JsonAlias("external-module")
    private List<ExternalModule> externalModules = new ArrayList<>();

    @JsonAlias("export-declaration")
    private List<ExportDeclaration> exportDeclarations = new ArrayList<>();

    @JsonAlias("dependency")
    private List<Dependency> dependencies = new ArrayList<>();

    @JsonAlias("react-component")
    private List<ReactComponent> reactComponents = new ArrayList<>();

}
