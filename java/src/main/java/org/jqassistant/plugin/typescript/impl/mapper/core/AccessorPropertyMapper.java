package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.AccessorPropertyDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.AccessorProperty;
import org.mapstruct.*;

import java.util.List;

@Mapper(uses = {GetterDeclarationMapper.class, SetterDeclarationMapper.class, AutoAccessorDeclarationMapper.class})
public interface AccessorPropertyMapper extends DescriptorMapper<AccessorProperty, AccessorPropertyDescriptor> {

    @Override
    @Mapping(source = "accessorName", target = "name")
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    AccessorPropertyDescriptor toDescriptor(AccessorProperty value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(AccessorProperty type, @MappingTarget AccessorPropertyDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<AccessorPropertyDescriptor> mapList(List<AccessorProperty> value, @Context Scanner scanner);
}
