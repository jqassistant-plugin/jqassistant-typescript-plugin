package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.TypeAliasDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.TypeAliasDeclaration;
import org.mapstruct.*;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class})
public interface TypeAliasDeclarationMapper extends
        DescriptorMapper<TypeAliasDeclaration, TypeAliasDeclarationDescriptor> {

    TypeAliasDeclarationMapper INSTANCE = getMapper(TypeAliasDeclarationMapper.class);

    @BeforeMapping
    default void before(TypeAliasDeclaration value, @MappingTarget TypeAliasDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).pushScope();
    }

    @Override
    @Mapping(source = "typeAliasName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeAliasDeclarationDescriptor toDescriptor(TypeAliasDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void after(TypeAliasDeclaration type, @MappingTarget TypeAliasDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerGlobalFqn(target);
        scanner.getContext().peek(TypeParameterResolver.class).popScope();
    }

    List<TypeAliasDeclarationDescriptor> mapList(List<TypeAliasDeclaration> value, @Context Scanner scanner);

}
