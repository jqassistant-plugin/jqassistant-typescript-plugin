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
public class ScanResultCollection {

    private List<Project> project = new ArrayList<>();

    private List<Module> module = new ArrayList<>();

    @JsonAlias("class-declaration")
    private List<ClassDeclaration> classDeclaration = new ArrayList<>();

}
