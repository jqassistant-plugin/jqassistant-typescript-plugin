package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.MethodDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.MethodDeclaration;
import org.mapstruct.*;

import java.util.List;

@Mapper(uses = {TypeMapper.class, ParameterDeclarationMapper.class, DecoratorMapper.class})
public interface MethodDeclarationMapper extends
        DescriptorMapper<MethodDeclaration, MethodDeclarationDescriptor> {

    @BeforeMapping
    default void before(MethodDeclaration value, @MappingTarget MethodDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).pushScope();
    }

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
    MethodDeclarationDescriptor toDescriptor(MethodDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void after(MethodDeclaration value, @MappingTarget MethodDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerGlobalFqn(target);
        scanner.getContext().peek(TypeParameterResolver.class).popScope();
    }

    List<MethodDeclarationDescriptor> mapList(List<MethodDeclaration> value, @Context Scanner scanner);

}
