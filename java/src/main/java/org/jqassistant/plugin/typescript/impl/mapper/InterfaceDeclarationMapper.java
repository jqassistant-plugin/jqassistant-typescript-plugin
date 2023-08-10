package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.InterfaceDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.InterfaceDeclaration;
import org.mapstruct.*;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, PropertyDeclarationMapper.class, MethodDeclarationMapper.class, GetterDeclarationMapper.class, SetterDeclarationMapper.class})
public interface InterfaceDeclarationMapper extends DescriptorMapper<InterfaceDeclaration, InterfaceDeclarationDescriptor> {

    InterfaceDeclarationMapper INSTANCE = getMapper(InterfaceDeclarationMapper.class);

    @Override
    @Mapping(source = "interfaceName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    InterfaceDeclarationDescriptor toDescriptor(InterfaceDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(InterfaceDeclaration type, @MappingTarget InterfaceDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<InterfaceDeclarationDescriptor> mapList(List<InterfaceDeclaration> value, @Context Scanner scanner);

}
