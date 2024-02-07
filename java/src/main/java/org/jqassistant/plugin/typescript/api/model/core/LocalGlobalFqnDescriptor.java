package org.jqassistant.plugin.typescript.api.model.core;

public interface LocalGlobalFqnDescriptor extends GlobalFqnDescriptor{

    String getLocalFqn();
    void setLocalFqn(String localFqn);

}
