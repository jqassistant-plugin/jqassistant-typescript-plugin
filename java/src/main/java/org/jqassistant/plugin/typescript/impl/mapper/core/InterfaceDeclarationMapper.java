package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.InterfaceDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.InterfaceDeclaration;
import org.mapstruct.*;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, PropertyDeclarationMapper.class, MethodDeclarationMapper.class, AccessorPropertyMapper.class})
public interface InterfaceDeclarationMapper extends
        DescriptorMapper<InterfaceDeclaration, InterfaceDeclarationDescriptor> {

    InterfaceDeclarationMapper INSTANCE = getMapper(InterfaceDeclarationMapper.class);

    @BeforeMapping
    default void before(InterfaceDeclaration value, @MappingTarget InterfaceDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).pushScope();
    }

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
    default void after(InterfaceDeclaration type, @MappingTarget InterfaceDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
        scanner.getContext().peek(TypeParameterResolver.class).popScope();
    }

    List<InterfaceDeclarationDescriptor> mapList(List<InterfaceDeclaration> value, @Context Scanner scanner);

}
