package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.FunctionDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.FunctionDeclaration;
import org.mapstruct.*;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, ParameterDeclarationMapper.class})
public interface FunctionDeclarationMapper extends DescriptorMapper<FunctionDeclaration, FunctionDeclarationDescriptor> {

    FunctionDeclarationMapper INSTANCE = getMapper(FunctionDeclarationMapper.class);

    @Override
    @Mapping(source = "functionName", target = "name")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    FunctionDeclarationDescriptor toDescriptor(FunctionDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerFqn(FunctionDeclaration type, @MappingTarget FunctionDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<FunctionDeclarationDescriptor> mapList(List<FunctionDeclaration> value, @Context Scanner scanner);
}
