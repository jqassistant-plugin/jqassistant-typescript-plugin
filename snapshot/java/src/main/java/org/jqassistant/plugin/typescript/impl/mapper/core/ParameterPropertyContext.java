package org.jqassistant.plugin.typescript.impl.mapper.core;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jqassistant.plugin.typescript.api.model.core.PropertyDeclarationDescriptor;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ParameterPropertyContext {

    private List<PropertyDeclarationDescriptor> parameterProperties = new ArrayList<>();

}
