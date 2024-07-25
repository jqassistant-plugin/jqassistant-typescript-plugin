package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.jqassistant.plugin.typescript.impl.model.ConceptCollection;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@ToString
public class Project {

    private String rootPath;

    private String projectPath;

    private List<String> subProjectPaths = new ArrayList<>();

    private List<String> sourceFilePaths = new ArrayList<>();

    private ConceptCollection concepts;

}
