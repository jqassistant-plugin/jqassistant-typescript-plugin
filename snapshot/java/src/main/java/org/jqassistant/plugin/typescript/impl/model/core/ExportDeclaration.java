package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ExportDeclaration {

    private String identifier;

    private String alias;

    private String globalDeclFqn;

    private String importSource;

    private Boolean sourceInProject;

    private Boolean isDefault;

    private String kind;

    private String sourceFilePathAbsolute;

}
