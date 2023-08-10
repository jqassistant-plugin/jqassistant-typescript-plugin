package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import org.jqassistant.plugin.typescript.api.model.ClassDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.ClassDeclaration;
import org.mapstruct.*;

import java.util.List;

import static org.mapstruct.factory.Mappers.getMapper;

@Mapper(uses = {TypeMapper.class, PropertyDeclarationMapper.class, ConstructorDeclarationMapper.class, MethodDeclarationMapper.class, GetterDeclarationMapper.class, SetterDeclarationMapper.class, DecoratorMapper.class})
public interface ClassDeclarationMapper extends DescriptorMapper<ClassDeclaration, ClassDeclarationDescriptor> {

    ClassDeclarationMapper INSTANCE = getMapper(ClassDeclarationMapper.class);

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
    default void registerFqn(ClassDeclaration type, @MappingTarget ClassDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerFqn(target);
    }

    List<ClassDeclarationDescriptor> mapList(List<ClassDeclaration> value, @Context Scanner scanner);

}
