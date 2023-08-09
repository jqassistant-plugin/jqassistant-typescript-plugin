package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import org.jqassistant.plugin.typescript.api.model.*;
import org.jqassistant.plugin.typescript.impl.mapper.base.DescriptorMapper;
import org.jqassistant.plugin.typescript.impl.model.*;
import org.mapstruct.*;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(uses = {TypeMapper.class})
public interface ValueMapper extends DescriptorMapper<Value, ValueDescriptor> {

    @Override
    @SubclassMapping(source = ValueNull.class, target = ValueNullDescriptor.class)
    @SubclassMapping(source = ValueLiteral.class, target = ValueLiteralDescriptor.class)
    @SubclassMapping(source = ValueDeclared.class, target = ValueDeclaredDescriptor.class)
    @SubclassMapping(source = ValueMember.class, target = ValueMemberDescriptor.class)
    @SubclassMapping(source = ValueObject.class, target = ValueObjectDescriptor.class)
    @SubclassMapping(source = ValueArray.class, target = ValueArrayDescriptor.class)
    @SubclassMapping(source = ValueCall.class, target = ValueCallDescriptor.class)
    @SubclassMapping(source = ValueFunction.class, target = ValueFunctionDescriptor.class)
    @SubclassMapping(source = ValueClass.class, target = ValueClassDescriptor.class)
    @SubclassMapping(source = ValueComplex.class, target = ValueComplexDescriptor.class)
    ValueDescriptor toDescriptor(Value value, @Context Scanner scanner);

    default List<ValueDescriptor> mapList(List<Value> value, @Context Scanner scanner) {
        return value.stream()
                .map(t -> toDescriptor(t, scanner))
                .collect(Collectors.toList());
    }

    ValueNullDescriptor mapValueNull(ValueNull value, @Context Scanner scanner);

    default ValueLiteralDescriptor mapValueLiteral(ValueLiteral value, @Context Scanner scanner) {
        if(value == null || value.getValue() == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        ValueLiteralDescriptor descriptor = scannerContext.getStore().create(ValueLiteralDescriptor.class);

        Object valueNormalized = value.getValue();
        if(!(valueNormalized instanceof String || valueNormalized instanceof Number || valueNormalized instanceof Boolean)) {
            valueNormalized = valueNormalized.toString();
        }
        descriptor.setValue(valueNormalized);

        TypeMapper typeMapper = Mappers.getMapper(TypeMapper.class);
        descriptor.setType(typeMapper.toDescriptor(value.getType(), scanner));
        return descriptor;
    }

    @Mapping(source = "fqn", target = "referencedFqn")
    @Mapping(target = "internal", ignore = true) // TODO: add internal property to JSON export
    @Mapping(target = "reference", ignore = true)
    ValueDeclaredDescriptor mapValueDeclared(ValueDeclared value, @Context Scanner scanner);

    @AfterMapping
    default void registerDeclaredRef(ValueDeclared type, @MappingTarget ValueDeclaredDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(FqnResolver.class).registerRef(target);
    }

    ValueMemberDescriptor mapValueMember(ValueMember value, @Context Scanner scanner);

    default ValueObjectDescriptor mapValueObject(ValueObject value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        ValueObjectDescriptor descriptor = scannerContext.getStore().create(ValueObjectDescriptor.class);
        value.getMembers().entrySet().forEach(member ->
                descriptor.getMembers().add(mapValueObjectMember(member, scanner))
        );

        TypeMapper typeMapper = Mappers.getMapper(TypeMapper.class);
        descriptor.setType(typeMapper.toDescriptor(value.getType(), scanner));
        return descriptor;
    }

    default ValueObjectMemberDescriptor mapValueObjectMember(Map.Entry<String, Value> value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        ValueObjectMemberDescriptor descriptor = scannerContext.getStore().create(ValueObjectMemberDescriptor.class);
        descriptor.setName(value.getKey());
        descriptor.setReference(toDescriptor(value.getValue(), scanner));
        descriptor.setType(descriptor.getReference().getType());
        return descriptor;
    }

    default ValueArrayDescriptor mapValueArray(ValueArray value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        ValueArrayDescriptor descriptor = scannerContext.getStore().create(ValueArrayDescriptor.class);
        List<Value> values = value.getItems();
        for (int i = 0; i < values.size(); i++) {
            Value item = values.get(i);
            ValueDescriptor itemDescriptor = toDescriptor(item, scanner);
            ValueArrayContainsDescriptor relationDescriptor = scannerContext.getStore().create(descriptor, ValueArrayContainsDescriptor.class, itemDescriptor);
            relationDescriptor.setIndex(i);
        }

        TypeMapper typeMapper = Mappers.getMapper(TypeMapper.class);
        descriptor.setType(typeMapper.toDescriptor(value.getType(), scanner));
        return descriptor;
    }

    default ValueCallDescriptor mapValueCall(ValueCall value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        ValueCallDescriptor descriptor = scannerContext.getStore().create(ValueCallDescriptor.class);

        for(int i = 0; i < value.getArgs().size(); i++) {
            Value arg = value.getArgs().get(i);
            ValueDescriptor argDescriptor = toDescriptor(arg, scanner);
            ValueCallHasArgumentDescriptor relationDescriptor = scannerContext.getStore().create(descriptor, ValueCallHasArgumentDescriptor.class, argDescriptor);
            relationDescriptor.setIndex(i);
        }

        TypeMapper typeMapper = Mappers.getMapper(TypeMapper.class);
        for(int i = 0; i < value.getTypeArgs().size(); i++) {
            Type typeArg = value.getTypeArgs().get(i);
            TypeDescriptor typeArgDescriptor = typeMapper.toDescriptor(typeArg, scanner);
            ValueCallHasTypeArgumentDescriptor relationDescriptor = scannerContext.getStore().create(descriptor, ValueCallHasTypeArgumentDescriptor.class, typeArgDescriptor);
            relationDescriptor.setIndex(i);
        }

        descriptor.setType(typeMapper.toDescriptor(value.getType(), scanner));

        return descriptor;
    }

    ValueFunctionDescriptor mapValueFunction(ValueFunction value, @Context Scanner scanner);

    ValueClassDescriptor mapValueClass(ValueClass value, @Context Scanner scanner);

    ValueComplexDescriptor mapValueComplex(ValueComplex value, @Context Scanner scanner);

    @ObjectFactory
    default ValueNullDescriptor resolveValueNull(ValueNull value, @TargetType Class<ValueNullDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueLiteralDescriptor resolveValueLiteral(ValueLiteral value, @TargetType Class<ValueLiteralDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueDeclaredDescriptor resolveValueDeclared(ValueDeclared value, @TargetType Class<ValueDeclaredDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueMemberDescriptor resolveValueMember(ValueMember value, @TargetType Class<ValueMemberDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueObjectDescriptor resolveValueObject(ValueObject value, @TargetType Class<ValueObjectDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueArrayDescriptor resolveValueArray(ValueArray value, @TargetType Class<ValueArrayDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueCallDescriptor resolveValueCall(ValueCall value, @TargetType Class<ValueCallDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueFunctionDescriptor resolveValueFunction(ValueFunction value, @TargetType Class<ValueFunctionDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueClassDescriptor resolveValueClass(ValueClass value, @TargetType Class<ValueClassDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }

    @ObjectFactory
    default ValueComplexDescriptor resolveValueComplex(ValueComplex value, @TargetType Class<ValueComplexDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
                .getStore()
                .create(descriptorType);
    }
}
