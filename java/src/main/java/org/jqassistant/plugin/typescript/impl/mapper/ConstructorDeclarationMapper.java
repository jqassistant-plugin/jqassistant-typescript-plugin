package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.ConstructorDeclarationDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.ConstructorDeclaration;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(uses = {ParameterDeclarationMapper.class})
public interface ConstructorDeclarationMapper extends DescriptorMapper<ConstructorDeclaration, ConstructorDeclarationDescriptor> {

    @Override
    default ConstructorDeclarationDescriptor toDescriptor(ConstructorDeclaration value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();

        ConstructorDeclarationDescriptor constructorDescriptor = scannerContext.getStore().create(ConstructorDeclarationDescriptor.class);
        constructorDescriptor.setFqn(value.getFqn());
        constructorDescriptor.setStartLine(value.getCoordinates().getStartLine());
        constructorDescriptor.setStartColumn(value.getCoordinates().getStartColumn());
        constructorDescriptor.setEndLine(value.getCoordinates().getEndLine());
        constructorDescriptor.setEndColumn(value.getCoordinates().getEndColumn());

        ParameterDeclarationMapper parameterMapper = Mappers.getMapper(ParameterDeclarationMapper.class);
        constructorDescriptor.getParameters().addAll(parameterMapper.mapList(value.getParameters(), scanner));
        constructorDescriptor.getParameters().addAll(parameterMapper.mapParameterPropertyList(value.getParameterProperties(), scanner));

        return constructorDescriptor;
    }

    List<ConstructorDeclarationDescriptor> mapList(List<ConstructorDeclaration> value, @Context Scanner scanner);

}
