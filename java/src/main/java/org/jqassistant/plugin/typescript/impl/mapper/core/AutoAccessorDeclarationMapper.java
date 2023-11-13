package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.AutoAccessorDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.AutoAccessorDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = {TypeMapper.class, DecoratorMapper.class})
public interface AutoAccessorDeclarationMapper extends DescriptorMapper<AutoAccessorDeclaration, AutoAccessorDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "staticc", target = "static")
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    AutoAccessorDeclarationDescriptor toDescriptor(AutoAccessorDeclaration value, @Context  Scanner scanner);

    List<AutoAccessorDeclarationDescriptor> mapList(List<AutoAccessorDeclaration> value, @Context Scanner scanner);
}
