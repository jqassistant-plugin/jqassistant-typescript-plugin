package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.xo.neo4j.api.annotation.Label;

/**
 * Represents a file from the local file system with an absolute path.
 */
@Label("Local")
public interface LocalFileDescriptor extends FileDescriptor {

    String getAbsoluteFileName();

    void setAbsoluteFileName(String absoluteFileName);
}
