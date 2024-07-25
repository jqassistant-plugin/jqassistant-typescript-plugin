package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.EnumDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.EnumDeclaration;
import org.mapstruct.*;

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
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    EnumDeclarationDescriptor toDescriptor(EnumDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(EnumDeclaration type, @MappingTarget EnumDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerGlobalFqn(target);
    }

    List<EnumDeclarationDescriptor> mapList(List<EnumDeclaration> value, @Context Scanner scanner);
}
