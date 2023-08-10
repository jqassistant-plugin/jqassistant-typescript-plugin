package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.EnumMemberDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.EnumMember;
import org.mapstruct.*;

import java.util.List;

@Mapper(uses = {ValueMapper.class})
public interface EnumMemberMapper extends DescriptorMapper<EnumMember, EnumMemberDescriptor> {

    @Override
    @Mapping(source = "enumMemberName", target = "name")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    EnumMemberDescriptor toDescriptor(EnumMember value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(EnumMember type, @MappingTarget EnumMemberDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<EnumMemberDescriptor> mapList(List<EnumMember> value, @Context Scanner scanner);

}
