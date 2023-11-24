package org.jqassistant.plugin.typescript;

import org.jqassistant.plugin.typescript.api.model.core.*;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.list;
import static org.assertj.core.api.InstanceOfAssertFactories.type;

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
            .hasFieldOrPropertyWithValue("arrowFunction", false);

        assertThat(value.getType())
            .as("function value has correct type")
            .isInstanceOf(TypeFunctionDescriptor.class);

        TypeFunctionDescriptor type = (TypeFunctionDescriptor)value.getType();

        assertThat(type)
            .as("function value's function type has all properties set correctly")
            .hasFieldOrPropertyWithValue("async", false);

        assertThat(type.getReturnType())
            .as("function value's function type's return type has correct type")
            .isNotNull()
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .extracting("name")
            .isEqualTo("string");

        assertThat(type.getTypeParameters())
            .as("function value's function type has one type parameter that is defined correctly")
            .hasSize(1)
            .anySatisfy((tp) -> {
                assertThat(tp)
                    .hasFieldOrPropertyWithValue("name", "T")
                    .hasFieldOrPropertyWithValue("index", 0);
                assertThat(tp.getConstraint())
                    .isInstanceOf(TypeObjectDescriptor.class)
                    .extracting("members", list(TypeObjectMemberDescriptor.class))
                    .hasSize(0);
            });


        assertThat(type.getFunctionParameters())
            .as("function value's function type has two parameters that are defined correctly")
            .hasSize(2)
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("name", "p1")
                    .hasFieldOrPropertyWithValue("index", 0)
                    .hasFieldOrPropertyWithValue("optional", false);
                assertThat(p.getType())
                    .isNotNull()
                    .isInstanceOf(TypeParameterReferenceDescriptor.class)
                    .extracting("name")
                    .isEqualTo("T");
                assertThat(((TypeParameterReferenceDescriptor)p.getType()).getReference())
                    .as("has correct type parameter reference")
                    .isEqualTo(type.getTypeParameters().get(0));
            })
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("name", "p2")
                    .hasFieldOrPropertyWithValue("index", 1)
                    .hasFieldOrPropertyWithValue("optional", false);
                assertThat(p.getType())
                    .isNotNull()
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .extracting("name")
                    .isEqualTo("number");
            });

        return this;
    }

    public ValueAssertions assertValueCall() {
        AtomicReference<ValueCallDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for call value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueCall");
                valueRef.set((ValueCallDescriptor) v.getInitValue());
            });

        ValueCallDescriptor value = valueRef.get();

        assertThat(value.getCallee())
            .as("call value has callee set correctly")
            .isNotNull()
            .isInstanceOf(ValueDeclaredDescriptor.class)
            .hasFieldOrPropertyWithValue("referencedFqn", "\"./src/testValues.ts\".valueFunction");

        assertThat(value.getArguments())
            .hasSize(2)
            .anySatisfy(arg -> {
                assertThat(arg.getIndex()).isEqualTo(0);
                assertThat(arg.getArgument())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", "")
                    .extracting("type", type(TypeDescriptor.class))
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "string");
            })
            .anySatisfy(arg -> {
                assertThat(arg.getIndex()).isEqualTo(1);
                assertThat(arg.getArgument())
                    .isInstanceOf(ValueLiteralDescriptor.class)
                    .hasFieldOrPropertyWithValue("value", 1)
                    .extracting("type", type(TypeDescriptor.class))
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            });

        assertThat(value.getTypeArguments())
            .hasSize(1)
            .first()
            .hasFieldOrPropertyWithValue("index", 0)
            .extracting("typeArgument", type(TypeDescriptor.class))
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .hasFieldOrPropertyWithValue("name", "string");

        return this;
    }

    public ValueAssertions assertValueClass() {
        AtomicReference<ValueClassDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for class value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueClass");
                valueRef.set((ValueClassDescriptor) v.getInitValue());
            });

        ValueClassDescriptor value = valueRef.get();

        assertThat(value.getType())
            .as("class value has correct type")
            .isInstanceOf(TypeNotIdentifiedDescriptor.class)
            .hasFieldOrPropertyWithValue("identifier", "class expression");

        return this;
    }

    public ValueAssertions assertValueComplex() {
        AtomicReference<ValueComplexDescriptor> valueRef = new AtomicReference<>();

        assertThat(module.getVariableDeclarations())
            .as("variable declaration for complex value exists")
            .anySatisfy((v) -> {
                assertThat(v.getName()).isEqualTo("valueComplex");
                valueRef.set((ValueComplexDescriptor) v.getInitValue());
            });

        ValueComplexDescriptor value = valueRef.get();

        assertThat(value)
            .as("complex value has all properties set correctly")
            .hasFieldOrPropertyWithValue("expression", "valueLiteral + 5");

        assertThat(value.getType())
            .as("complex value has correct type")
            .isInstanceOf(TypeNotIdentifiedDescriptor.class)
            .hasFieldOrPropertyWithValue("identifier", "complex");

        return this;
    }

}
