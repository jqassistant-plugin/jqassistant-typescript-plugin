package org.jqassistant.plugin.typescript.impl.model.core;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CodeCoordinates {

    private String fileName;

    private Integer startLine;

    private Integer startColumn;

    private Integer endLine;

    private Integer endColumn;

}
