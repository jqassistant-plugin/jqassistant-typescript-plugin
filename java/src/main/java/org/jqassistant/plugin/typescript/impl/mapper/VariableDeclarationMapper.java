package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.VariableDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.VariableDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, ValueMapper.class})
public interface VariableDeclarationMapper extends DescriptorMapper<VariableDeclaration, VariableDeclarationDescriptor> {

    VariableDeclarationMapper INSTANCE = getMapper(VariableDeclarationMapper.class);

    @Override
    @Mapping(source = "variableName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    VariableDeclarationDescriptor toDescriptor(VariableDeclaration value, @Context Scanner scanner);

    List<VariableDeclarationDescriptor> mapList(List<VariableDeclaration> value, @Context Scanner scanner);
}
