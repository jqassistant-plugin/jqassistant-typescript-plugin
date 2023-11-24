package org.jqassistant.plugin.typescript.impl.mapper.core;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.core.DecoratorDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.ParameterDeclarationDescriptor;
import org.jqassistant.plugin.typescript.api.model.core.PropertyDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.model.core.ParameterDeclaration;
import org.jqassistant.plugin.typescript.impl.model.core.ParameterPropertyDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(uses = {TypeMapper.class, PropertyDeclarationMapper.class, DecoratorMapper.class})
public interface ParameterDeclarationMapper extends
        DescriptorMapper<ParameterDeclaration, ParameterDeclarationDescriptor> {

    @Override
    @Mapping(source = "coordinates.startLine", target = "startLine")
    @Mapping(source = "coordinates.startColumn", target = "startColumn")
    @Mapping(source = "coordinates.endLine", target = "endLine")
    @Mapping(source = "coordinates.endColumn", target = "endColumn")
    @Mapping(target = "fileName", ignore = true)
    @Mapping(target = "parameterProperty", ignore = true)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    ParameterDeclarationDescriptor toDescriptor(ParameterDeclaration value, @Context Scanner scanner);

    List<ParameterDeclarationDescriptor> mapList(List<ParameterDeclaration> value, @Context Scanner scanner);

    default ParameterDeclarationDescriptor mapParameterProperty(ParameterPropertyDeclaration value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();

        DecoratorMapper decoratorMapper = Mappers.getMapper(DecoratorMapper.class);
        List<DecoratorDescriptor> decorators = decoratorMapper.mapList(value.getDecorators(), scanner);

        ParameterDeclarationDescriptor parameterDescriptor = scannerContext.getStore().create(ParameterDeclarationDescriptor.class);
        parameterDescriptor.setName(value.getPropertyName());
        parameterDescriptor.setOptional(value.getOptional());
        parameterDescriptor.setIndex(value.getIndex());
        parameterDescriptor.setStartLine(value.getCoordinates().getStartLine());
        parameterDescriptor.setStartColumn(value.getCoordinates().getStartColumn());
        parameterDescriptor.setEndLine(value.getCoordinates().getEndLine());
        parameterDescriptor.setEndColumn(value.getCoordinates().getEndColumn());
        parameterDescriptor.getDecorators().addAll(decorators);

        PropertyDeclarationMapper propertyDeclarationMapper = Mappers.getMapper(PropertyDeclarationMapper.class);
        PropertyDeclarationDescriptor propertyDescriptor = propertyDeclarationMapper.toDescriptor(value, scanner);

        parameterDescriptor.setParameterProperty(propertyDescriptor);
        scannerContext.peek(ParameterPropertyContext.class).getParameterProperties().add(propertyDescriptor);

        return parameterDescriptor;
    }

    List<ParameterDeclarationDescriptor> mapParameterPropertyList(List<ParameterPropertyDeclaration> value, @Context Scanner scanner);

}
