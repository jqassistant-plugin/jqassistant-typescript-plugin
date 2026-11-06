package org.jqassistant.plugin.typescript.api.model.core;

import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.LocalDescriptor;

/**
 * Represents a file from the local file system with an absolute path.
 */
public interface LocalFileDescriptor extends FileDescriptor, LocalDescriptor {

    String getAbsoluteFileName();

    void setAbsoluteFileName(String absoluteFileName);
}
