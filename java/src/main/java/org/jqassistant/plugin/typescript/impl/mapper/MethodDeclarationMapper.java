package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.MethodDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.MethodDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = {TypeMapper.class, ParameterDeclarationMapper.class, DecoratorMapper.class})
public interface MethodDeclarationMapper extends DescriptorMapper<MethodDeclaration, MethodDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "staticc", target = "static")
    @Mapping(source = "methodName", target = "name")
    @Mapping(target = "fileName", ignore = true)
    MethodDeclarationDescriptor toDescriptor(MethodDeclaration value, @Context Scanner scanner);

    List<MethodDeclarationDescriptor> mapList(List<MethodDeclaration> value, @Context Scanner scanner);

}
