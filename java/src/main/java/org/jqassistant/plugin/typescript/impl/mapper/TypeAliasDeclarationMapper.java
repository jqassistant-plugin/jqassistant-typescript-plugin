package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.TypeAliasDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.TypeAliasDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class})
public interface TypeAliasDeclarationMapper extends DescriptorMapper<TypeAliasDeclaration, TypeAliasDeclarationDescriptor> {

    TypeAliasDeclarationMapper INSTANCE = getMapper(TypeAliasDeclarationMapper.class);

    @Override
    @Mapping(source = "typeAliasName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    TypeAliasDeclarationDescriptor toDescriptor(TypeAliasDeclaration value, @Context Scanner scanner);

    List<TypeAliasDeclarationDescriptor> mapList(List<TypeAliasDeclaration> value, @Context Scanner scanner);

}
