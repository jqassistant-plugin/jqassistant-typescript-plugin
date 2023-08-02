package org.jqassistant.plugin.typescript.api.model;

public interface CodeCoordinateDescriptor {

    String getFileName();
    void setFileName(String fileName);

    Integer getStartLine();
    void setStartLine(Integer startLine);

    Integer getStartColumn();
    void setStartColumn(Integer startColumn);

    Integer getEndLine();
    void setEndLine(Integer endLine);

    Integer getEndColumn();
    void setEndColumn(Integer endColumn);

}
