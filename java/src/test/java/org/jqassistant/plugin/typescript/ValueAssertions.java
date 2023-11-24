package org.jqassistant.plugin.typescript;

import org.jqassistant.plugin.typescript.api.model.core.*;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.list;

public class ValueAssertions {

    ProjectDescriptor project;
    ModuleDescriptor module;

    public ValueAssertions(ProjectDescriptor project) {
        this.project = project;
    }

    public ValueAssertions assertModulePresence() {
        Optional<ModuleDescriptor> moduleDescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getFqn().equals("./src/testValues.ts"))
            .findFirst();

        assertThat(moduleDescriptorOptional.isPresent())
            .as("values module is present")
            .isTrue();

        moduleDescriptorOptional.ifPresent(moduleDescriptor -> this.module = moduleDescriptor);

        return this;
    }

    public ValueAssertions assertValueNull() {
        AtomicReference<ValueNullDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for null value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueNull");
                valueRef.set((ValueNullDescriptor) v.getInitValue());
            });

        ValueNullDescriptor value = valueRef.get();

        assertThat(value)
            .as("null value has all properties set correctly")
            .hasFieldOrPropertyWithValue("kind", "null");

        assertThat(value.getType())
            .as("null value has correct type")
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .hasFieldOrPropertyWithValue("name", "null");

        return this;
    }

    public ValueAssertions assertValueLiteral() {
        AtomicReference<ValueLiteralDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for literal value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueLiteral");
                valueRef.set((ValueLiteralDescriptor) v.getInitValue());
            });

        ValueLiteralDescriptor value = valueRef.get();

        assertThat(value)
            .as("literal value has all properties set correctly")
            .hasFieldOrPropertyWithValue("value", 5);

        assertThat(value.getType())
            .as("literal value has correct type")
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .hasFieldOrPropertyWithValue("name", "number");

        return this;
    }

    public ValueAssertions assertValueDeclared() {
        AtomicReference<ValueDeclaredDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for declared value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueDeclared");
                valueRef.set((ValueDeclaredDescriptor) v.getInitValue());
            });

        ValueDeclaredDescriptor value = valueRef.get();

        assertThat(value)
            .as("declared value has all properties set correctly")
            .hasFieldOrPropertyWithValue("referencedFqn", "\"./src/testValues.ts\".valueNull");

        var nullVariableDeclaration = module.getVariableDeclarations().stream()
            .filter(vd -> vd.getName().equals("valueNull")).findFirst().orElseThrow();
        assertThat(value.getReference())
            .as("declared value references correct declaration")
            .isEqualTo(nullVariableDeclaration);

        assertThat(value.getType())
            .as("declared value has correct type")
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .hasFieldOrPropertyWithValue("name", "null");

        return this;
    }

    public ValueAssertions assertValueObject() {
        AtomicReference<ValueObjectDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for object value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueObject");
                valueRef.set((ValueObjectDescriptor) v.getInitValue());
            });

        ValueObjectDescriptor value = valueRef.get();

        assertThat(value.getMembers())
            .as("object value has two correctly defined members")
            .hasSize(2)
            .anySatisfy(m -> {
                assertThat(m.getName()).isEqualTo("a");
                assertThat(m.getReference())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", 1);
                assertThat(m.getReference().getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            })
            .anySatisfy(m -> {
                assertThat(m.getName()).isEqualTo("b");
                assertThat(m.getReference())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", "");
                assertThat(m.getReference().getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "string");
            });

        assertThat(value.getType())
            .as("object value has correct object type")
            .isInstanceOf(TypeObjectDescriptor.class)
            .extracting("members", list(TypeObjectMemberDescriptor.class))
            .hasSize(2)
            .anySatisfy((tm) -> {
                assertThat(tm)
                    .hasFieldOrPropertyWithValue("name", "a")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false);
                assertThat(tm.getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            })
            .anySatisfy((tm) -> {
                assertThat(tm)
                    .hasFieldOrPropertyWithValue("name", "b")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false);
                assertThat(tm.getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "string");
            });

        return this;
    }

    public ValueAssertions assertValueArray() {
        AtomicReference<ValueArrayDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for array value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueArray");
                valueRef.set((ValueArrayDescriptor) v.getInitValue());
            });

        ValueArrayDescriptor value = valueRef.get();

        assertThat(value.getItems())
            .as("arrray value has three correctly defined members")
            .hasSize(3)
            .anySatisfy(m -> {
                assertThat(m.getIndex()).isEqualTo(0);
                assertThat(m.getItem())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", 1);
                assertThat(m.getItem().getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            })
            .anySatisfy(m -> {
                assertThat(m.getIndex()).isEqualTo(1);
                assertThat(m.getItem())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", 2);
                assertThat(m.getItem().getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            })
            .anySatisfy(m -> {
                assertThat(m.getIndex()).isEqualTo(2);
                assertThat(m.getItem())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", 3);
                assertThat(m.getItem().getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            });

        assertThat(value.getType())
            .as("array value has correct type")
            .isInstanceOf(TypeDeclaredDescriptor.class)
            .hasFieldOrPropertyWithValue("referencedFqn", "Array")
            .extracting("typeArguments", list(TypeDescriptor.class))
            .hasSize(1)
            .first()
            .isInstanceOf(TypeDeclaredHasTypeArgumentDescriptor.class)
            .hasFieldOrPropertyWithValue("index", 0)
            .extracting("typeArgument")
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .hasFieldOrPropertyWithValue("name", "number");

        return this;
    }

    public ValueAssertions assertValueFunction() {
        AtomicReference<ValueFunctionDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for function value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueFunction");
                valueRef.set((ValueFunctionDescriptor) v.getInitValue());
            });

        ValueFunctionDescriptor value = valueRef.get();

        assertThat(value)
            .as("function value has all properties set correctly")
            .hasFieldOrPropertyWithValue("arrowFunction", "false");

        assertThat(value.getType())
            .as("function value has correct type")
            .isInstanceOf(TypeFunctionDescriptor.class);

        TypeFunctionDescriptor type = (TypeFunctionDescriptor)value.getType();

        // TODO: check type information
//        assertThat(type)
//            .as("function value's function type has all properties set correctly")
//            .hasFieldOrPropertyWithValue("async", false);
//
//        assertThat(type.getReturnType())
//            .as("function value's function type's return type has correct type")
//            .isNotNull()
//            .isInstanceOf(TypePrimitiveDescriptor.class)
//            .extracting("name")
//            .isEqualTo("string");
//
//        assertThat(type.getTypeParameters())
//            .as("function value's function type has one type parameter that is defined correctly")
//            .hasSize(1)
//            .anySatisfy((tp) -> {
//                assertThat(tp)
//                    .hasFieldOrPropertyWithValue("name", "A")
//                    .hasFieldOrPropertyWithValue("index", 0);
//                assertThat(tp.getConstraint())
//                    .isInstanceOf(TypeDeclaredDescriptor.class)
//                    .hasFieldOrPropertyWithValue("referencedFqn", "\"./src/testTypes.ts\".typeObject");
//            });
//
//
//        assertThat(type.getFunctionParameters())
//            .as("function value's function type has two parameters that are defined correctly")
//            .hasSize(2)
//            .anySatisfy((p) -> {
//                assertThat(p)
//                    .hasFieldOrPropertyWithValue("name", "x")
//                    .hasFieldOrPropertyWithValue("index", 0)
//                    .hasFieldOrPropertyWithValue("optional", false);
//                assertThat(p.getType())
//                    .isNotNull()
//                    .isInstanceOf(TypePrimitiveDescriptor.class)
//                    .extracting("name")
//                    .isEqualTo("number");
//            })
//            .anySatisfy((p) -> {
//                assertThat(p)
//                    .hasFieldOrPropertyWithValue("name", "y")
//                    .hasFieldOrPropertyWithValue("index", 1)
//                    .hasFieldOrPropertyWithValue("optional", false);
//                assertThat(p.getType())
//                    .isNotNull()
//                    .isInstanceOf(TypeParameterReferenceDescriptor.class)
//                    .extracting("name")
//                    .isEqualTo("A");
//                assertThat(((TypeParameterReferenceDescriptor)p.getType()).getReference())
//                    .as("has correct type parameter reference")
//                    .isEqualTo(type.getTypeParameters().get(0));
//            });

        return this;
    }

}
