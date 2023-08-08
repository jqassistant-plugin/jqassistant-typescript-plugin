package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.EnumDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.EnumDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {EnumMemberMapper.class})
public interface EnumDeclarationMapper extends DescriptorMapper<EnumDeclaration, EnumDeclarationDescriptor> {

    EnumDeclarationMapper INSTANCE = getMapper(EnumDeclarationMapper.class);

    @Override
    @Mapping(source = "enumName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    EnumDeclarationDescriptor toDescriptor(EnumDeclaration value, @Context Scanner scanner);

    List<EnumDeclarationDescriptor> mapList(List<EnumDeclaration> value, @Context Scanner scanner);
}
