package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.FunctionDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.FunctionDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, ParameterDeclarationMapper.class})
public interface FunctionDeclarationMapper extends DescriptorMapper<FunctionDeclaration, FunctionDeclarationDescriptor> {

    FunctionDeclarationMapper INSTANCE = getMapper(FunctionDeclarationMapper.class);

    @Override
    @Mapping(source = "functionName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    FunctionDeclarationDescriptor toDescriptor(FunctionDeclaration value, @Context Scanner scanner);

    List<FunctionDeclarationDescriptor> mapList(List<FunctionDeclaration> value, @Context Scanner scanner);
}
