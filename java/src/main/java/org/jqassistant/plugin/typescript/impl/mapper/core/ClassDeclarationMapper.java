package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.ClassDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.ClassDeclaration;
import org.mapstruct.*;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, PropertyDeclarationMapper.class, ConstructorDeclarationMapper.class, MethodDeclarationMapper.class, AccessorPropertyMapper.class, DecoratorMapper.class})
public interface ClassDeclarationMapper extends
        DescriptorMapper<ClassDeclaration, ClassDeclarationDescriptor> {

    ClassDeclarationMapper INSTANCE = getMapper(ClassDeclarationMapper.class);

    @BeforeMapping
    default void before(ClassDeclaration value, @MappingTarget ClassDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).pushScope();
        scanner.getContext().push(ParameterPropertyContext.class, new ParameterPropertyContext());
    }

    @Override
    @Mapping(source = "className", target = "name")
    @Mapping(source = "abstractt", target = "abstract")
    @Mapping(source = "coordinates.fileName", target = "fileName")
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    ClassDeclarationDescriptor toDescriptor(ClassDeclaration type, @Context Scanner scanner);

    @AfterMapping
    default void after(ClassDeclaration value, @MappingTarget ClassDeclarationDescriptor target, @Context Scanner scanner) {
        target.getProperties().addAll(scanner.getContext().pop(ParameterPropertyContext.class).getParameterProperties());
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
        scanner.getContext().peek(TypeParameterResolver.class).popScope();
    }

    List<ClassDeclarationDescriptor> mapList(List<ClassDeclaration> value, @Context Scanner scanner);

}
