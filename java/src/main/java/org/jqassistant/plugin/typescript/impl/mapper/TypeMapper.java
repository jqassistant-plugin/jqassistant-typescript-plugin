package org.jqassistant.plugin.typescript.impl.mapper;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.plugin.common.api.mapper.DescriptorMapper;
import org.jqassistant.plugin.typescript.api.model.*;
import org.jqassistant.plugin.typescript.impl.model.*;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;


@Mapper
public interface TypeMapper extends DescriptorMapper<Type, TypeDescriptor> {

    @Override
    @SubclassMapping(source = TypePrimitive.class, target = TypePrimitiveDescriptor.class)
    @SubclassMapping(source = TypeDeclared.class, target = TypeDeclaredDescriptor.class)
    @SubclassMapping(source = TypeUnion.class, target = TypeUnionDescriptor.class)
    @SubclassMapping(source = TypeIntersection.class, target = TypeIntersectionDescriptor.class)
    @SubclassMapping(source = TypeObject.class, target = TypeObjectDescriptor.class)
    @SubclassMapping(source = TypeFunction.class, target = TypeFunctionDescriptor.class)
    @SubclassMapping(source = TypeParameterReference.class, target = TypeParameterReferenceDescriptor.class)
    @SubclassMapping(source = TypeLiteral.class, target = TypeLiteralDescriptor.class)
    @SubclassMapping(source = TypeTuple.class, target = TypeTupleDescriptor.class)
    @SubclassMapping(source = TypeNotIdentified.class, target = TypeNotIdentifiedDescriptor.class)
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeDescriptor toDescriptor(Type value, @Context Scanner scanner);

    default List<TypeDescriptor> mapList(List<Type> value, @Context Scanner scanner) {
        return value.stream()
            .map(t -> toDescriptor(t, scanner))
            .collect(Collectors.toList());
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeParameterDeclarationDescriptor mapTypeParameterDeclaration(TypeParameterDeclaration value, @Context Scanner scanner);

    @AfterMapping
    default void registerTypeParameterDeclaration(TypeParameterDeclaration value, @MappingTarget TypeParameterDeclarationDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).registerParameter(target);
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    List<TypeParameterDeclarationDescriptor> mapTypeParameterDeclarationList(List<TypeParameterDeclaration> value, @Context Scanner scanner);

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypePrimitiveDescriptor mapTypePrimitive(TypePrimitive value, @Context Scanner scanner);

    default TypeDeclaredDescriptor mapTypeDeclared(TypeDeclared value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        TypeDeclaredDescriptor descriptor = scannerContext.getStore().create(TypeDeclaredDescriptor.class);
        descriptor.setReferencedFqn(value.getFqn());
        for(int i = 0; i < value.getTypeArguments().size(); i++) {
            Type arg = value.getTypeArguments().get(i);
            TypeDescriptor argDescriptor = toDescriptor(arg, scanner);
            TypeDeclaredHasTypeArgumentDescriptor relationDescriptor = scannerContext.getStore().create(descriptor, TypeDeclaredHasTypeArgumentDescriptor.class, argDescriptor);
            relationDescriptor.setIndex(i);
        }
        scannerContext.peek(FqnResolver.class).registerRef(descriptor);
        return descriptor;
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeUnionDescriptor mapTypeUnion(TypeUnion value, @Context Scanner scanner);

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeIntersectionDescriptor mapTypeIntersection(TypeIntersection value, @Context Scanner scanner);

    default TypeObjectDescriptor mapTypeObject(TypeObject value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        TypeObjectDescriptor descriptor = scannerContext.getStore().create(TypeObjectDescriptor.class);
        value.getMembers().forEach(member ->
            descriptor.getMembers().add(mapTypeObjectMember(member, scanner))
        );
        return descriptor;
    }

    default TypeObjectMemberDescriptor mapTypeObjectMember(TypeObjectMember value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        TypeObjectMemberDescriptor descriptor = scannerContext.getStore().create(TypeObjectMemberDescriptor.class);
        descriptor.setName(value.getName());
        descriptor.setOptional(value.getOptional());
        descriptor.setReadonly(value.getReadonly());
        descriptor.setType(toDescriptor(value.getType(), scanner));
        return descriptor;
    }

    @BeforeMapping
    default void before(TypeFunction value, @MappingTarget TypeFunctionDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).pushScope();
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeFunctionDescriptor mapTypeFunction(TypeFunction value, @Context Scanner scanner);

    @AfterMapping
    default void after(TypeFunction value, @MappingTarget TypeFunctionDescriptor target, @Context Scanner scanner) {
        scanner.getContext().peek(TypeParameterResolver.class).popScope();
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeFunctionParameterDescriptor mapTypeFunctionParameter(TypeFunctionParameter value, @Context Scanner scanner);

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    List<TypeFunctionParameterDescriptor> mapTypeFunctionParameterList(List<TypeFunctionParameter> value, @Context Scanner scanner);

    @Mapping(target = "reference", ignore = true) // TODO: add reference resolution
    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeParameterReferenceDescriptor mapTypeParameterReference(TypeParameterReference value, @Context Scanner scanner);

    @AfterMapping
    default void resolveTypeParameterReferenceRef(TypeParameterReference value, @MappingTarget TypeParameterReferenceDescriptor target, @Context Scanner scanner) {
        target.setReference(scanner.getContext().peek(TypeParameterResolver.class).resolveParameter(value.getName()));
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeLiteralDescriptor mapTypeLiteral(TypeLiteral value, @Context Scanner scanner);

    default TypeTupleDescriptor mapTypeTuple(TypeTuple value, @Context Scanner scanner) {
        if(value == null) {
            return null;
        }
        ScannerContext scannerContext = scanner.getContext();
        TypeTupleDescriptor descriptor = scannerContext.getStore().create(TypeTupleDescriptor.class);
        List<Type> types = value.getTypes();
        for (int i = 0; i < types.size(); i++) {
            Type item = types.get(i);
            TypeDescriptor itemDescriptor = toDescriptor(item, scanner);
            TypeTupleContainsDescriptor relationDescriptor = scannerContext.getStore().create(descriptor, TypeTupleContainsDescriptor.class, itemDescriptor);
            relationDescriptor.setIndex(i);
        }
        return descriptor;
    }

    @Mapping(target = "dependents", ignore = true)
    @Mapping(target = "dependencies", ignore = true)
    @Mapping(target = "exporters", ignore = true)
    TypeNotIdentifiedDescriptor mapTypeNotIdentified(TypeNotIdentified value, @Context Scanner scanner);

    @ObjectFactory
    default TypeParameterDeclarationDescriptor resolveTypeParameterDeclaration(TypeParameterDeclaration value, @TargetType Class<TypeParameterDeclarationDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypePrimitiveDescriptor resolveTypePrimitive(TypePrimitive value, @TargetType Class<TypePrimitiveDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeDeclaredDescriptor resolveTypeDeclared(TypeDeclared value, @TargetType Class<TypeDeclaredDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeUnionDescriptor resolveTypeUnion(TypeUnion value, @TargetType Class<TypeUnionDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeIntersectionDescriptor resolveTypeIntersection(TypeIntersection value, @TargetType Class<TypeIntersectionDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeFunctionDescriptor resolveTypeFunction(TypeFunction value, @TargetType Class<TypeFunctionDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeFunctionParameterDescriptor resolveTypeFunctionParameter(TypeFunctionParameter value, @TargetType Class<TypeFunctionParameterDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeParameterReferenceDescriptor resolveTypeParameterReference(TypeParameterReference value, @TargetType Class<TypeParameterReferenceDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeLiteralDescriptor resolveTypeLiteral(TypeLiteral value, @TargetType Class<TypeLiteralDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

    @ObjectFactory
    default TypeNotIdentifiedDescriptor resolveTypeNotIdentified(TypeNotIdentified value, @TargetType Class<TypeNotIdentifiedDescriptor> descriptorType, @Context Scanner scanner) {
        return scanner.getContext()
            .getStore()
            .create(descriptorType);
    }

}
