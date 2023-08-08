package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.GetterDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.GetterDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(uses = {TypeMapper.class, DecoratorMapper.class})
public interface GetterDeclarationMapper extends DescriptorMapper<GetterDeclaration, GetterDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "staticc", target = "static")
    @Mapping(source = "methodName", target = "name")
    @Mapping(target = "fileName", ignore = true)
    GetterDeclarationDescriptor toDescriptor(GetterDeclaration value, @Context Scanner scanner);

    List<GetterDeclarationDescriptor> mapList(List<GetterDeclaration> value, @Context Scanner scanner);

}
