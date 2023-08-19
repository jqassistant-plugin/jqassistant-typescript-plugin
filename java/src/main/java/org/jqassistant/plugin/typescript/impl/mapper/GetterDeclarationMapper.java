package org.jqassistant.plugin.typescript.impl.mapper;

import java.util.List;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;

import org.jqassistant.plugin.typescript.api.model.GetterDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.GetterDeclaration;
import org.mapstruct.*;

@Mapper(uses = {TypeMapper.class, DecoratorMapper.class})
public interface GetterDeclarationMapper extends
        DescriptorMapper<GetterDeclaration, GetterDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "staticc", target = "static")
    @Mapping(source = "methodName", target = "name")
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    GetterDeclarationDescriptor toDescriptor(GetterDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(GetterDeclaration type, @MappingTarget GetterDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<GetterDeclarationDescriptor> mapList(List<GetterDeclaration> value, @Context Scanner scanner);

}
