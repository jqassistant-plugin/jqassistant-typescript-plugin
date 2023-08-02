package org.jqassistant.plugin.typescript.impl.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class PropertyDeclaration extends NamedConcept {

    private String propertyName;

    private Boolean optional;

    private Type type;

    private List<Decorator> decorators = new ArrayList<>();

    private String visibility;

    private Boolean readonly;

    private CodeCoordinates coordinates;

    private Boolean override;

    @JsonAlias("abstract")
    private Boolean abstractt;

    @JsonAlias("isStatic")
    private Boolean staticc;

}
