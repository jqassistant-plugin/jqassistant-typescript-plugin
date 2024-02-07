package org.jqassistant.plugin.typescript.core.basics.assertions;

import org.jqassistant.plugin.typescript.api.model.core.*;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

public class TypeAssertions {

    ProjectDescriptor project;
    ModuleDescriptor module;

    public TypeAssertions(ProjectDescriptor project) {
        this.project = project;
    }

    public TypeAssertions assertModulePresence() {
        Optional<ModuleDescriptor> moduleDescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getGlobalFqn().equals("/java/src/test/resources/java-it-core-basics-sample-project/src/testTypes.ts"))
            .findFirst();

        assertThat(moduleDescriptorOptional.isPresent())
            .as("types module is present")
            .isTrue();

        assertThat(moduleDescriptorOptional.get().getLocalFqn())
            .as("declaration module has correct local FQN")
            .isEqualTo("./src/testTypes.ts");

        moduleDescriptorOptional.ifPresent(moduleDescriptor -> this.module = moduleDescriptor);

        return this;
    }

    public TypeAssertions assertPrimitiveType() {
        AtomicReference<TypePrimitiveDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for primitive type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typePrimitive");
                typeRef.set((TypePrimitiveDescriptor) t.getType());
            });

        TypePrimitiveDescriptor type = typeRef.get();

        assertThat(type)
            .as("primitive type has all properties set correctly")
            .hasFieldOrPropertyWithValue("name", "number");

        return this;
    }

    public TypeAssertions assertDeclaredType() {
        AtomicReference<TypeDeclaredDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for declared type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeDeclared");
                typeRef.set((TypeDeclaredDescriptor) t.getType());
            });

        TypeDeclaredDescriptor type = typeRef.get();

        assertThat(type)
            .as("declared type has all properties set correctly")
            .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseInterface");

        InterfaceDeclarationDescriptor interfaceDecl = project.getModules().stream()
            .filter(m -> m.getLocalFqn().equals("./src/utils.ts"))
            .findFirst().orElseThrow().getInterfaceDeclarations().stream()
            .filter(id -> id.getName().equals("BaseInterface")).findFirst().orElseThrow();
        assertThat(type.getReference())
            .as("declared type references correct declaration")
            .isEqualTo(interfaceDecl);

        assertThat(type.getTypeArguments())
            .as("declared type has no type parameters")
            .hasSize(0);

        return this;
    }

    public TypeAssertions assertUnionType() {
        AtomicReference<TypeUnionDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for union type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeUnion");
                typeRef.set((TypeUnionDescriptor) t.getType());
            });

        TypeUnionDescriptor type = typeRef.get();

        assertThat(type.getTypes())
            .as("union type has correctly defined constituents")
            .hasSize(2)
            .anySatisfy((t) -> {
                assertThat(t)
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            })
            .anySatisfy((t) -> {
                assertThat(t)
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "string");
            });

        return this;
    }

    public TypeAssertions assertIntersectionType() {
        AtomicReference<TypeIntersectionDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for intersection type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeIntersection");
                typeRef.set((TypeIntersectionDescriptor) t.getType());
            });

        TypeIntersectionDescriptor type = typeRef.get();

        assertThat(type.getTypes())
            .as("intersection type has correctly defined constituents")
            .hasSize(2)
            .anySatisfy((t) -> {
                assertThat(t)
                    .isInstanceOf(TypeDeclaredDescriptor.class)
                    .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseInterface");
            })
            .anySatisfy((t) -> {
                assertThat(t)
                    .isInstanceOf(TypeDeclaredDescriptor.class)
                    .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseInterface2");
            });

        return this;
    }

    public TypeAssertions assertObjectType() {
        AtomicReference<TypeObjectDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for object type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeObject");
                typeRef.set((TypeObjectDescriptor) t.getType());
            });

        TypeObjectDescriptor type = typeRef.get();

        assertThat(type.getMembers())
            .as("object type has correctly defined members")
            .hasSize(2)
            .anySatisfy((m) -> {
                assertThat(m)
                    .hasFieldOrPropertyWithValue("name", "a")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false);
                assertThat(m.getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            })
            .anySatisfy((m) -> {
                assertThat(m)
                    .hasFieldOrPropertyWithValue("name", "b")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false);
                assertThat(m.getType())
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "string");
            });

        return this;
    }

    public TypeAssertions assertFunctionType() {
        AtomicReference<TypeFunctionDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for function type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeFunction");
                typeRef.set((TypeFunctionDescriptor) t.getType());
            });

        TypeFunctionDescriptor type = typeRef.get();

        assertThat(type)
            .as("function type has all properties set correctly")
            .hasFieldOrPropertyWithValue("async", false);

        assertThat(type.getReturnType())
            .as("function type's return type has correct type")
            .isNotNull()
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .extracting("name")
            .isEqualTo("string");

        assertThat(type.getTypeParameters())
            .as("function type has one type parameter that is defined correctly")
            .hasSize(1)
            .anySatisfy((tp) -> {
                assertThat(tp)
                    .hasFieldOrPropertyWithValue("name", "A")
                    .hasFieldOrPropertyWithValue("index", 0);
                assertThat(tp.getConstraint())
                    .isInstanceOf(TypeDeclaredDescriptor.class)
                    .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testTypes.ts\".typeObject");
            });


        assertThat(type.getFunctionParameters())
            .as("function type has two parameters that are defined correctly")
            .hasSize(2)
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("name", "x")
                    .hasFieldOrPropertyWithValue("index", 0)
                    .hasFieldOrPropertyWithValue("optional", false);
                assertThat(p.getType())
                    .isNotNull()
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .extracting("name")
                    .isEqualTo("number");
            })
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("name", "y")
                    .hasFieldOrPropertyWithValue("index", 1)
                    .hasFieldOrPropertyWithValue("optional", false);
                assertThat(p.getType())
                    .isNotNull()
                    .isInstanceOf(TypeParameterReferenceDescriptor.class)
                    .extracting("name")
                    .isEqualTo("A");
                assertThat(((TypeParameterReferenceDescriptor)p.getType()).getReference())
                    .as("has correct type parameter reference")
                    .isEqualTo(type.getTypeParameters().get(0));
            });

        return this;
    }

    public TypeAssertions assertLiteralType() {
        AtomicReference<TypeLiteralDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for literal type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeLiteral");
                typeRef.set((TypeLiteralDescriptor) t.getType());
            });

        TypeLiteralDescriptor type = typeRef.get();

        assertThat(type)
            .as("literal type has all properties set correctly")
            .hasFieldOrPropertyWithValue("value", 1);

        return this;
    }

    public TypeAssertions assertTupleType() {
        AtomicReference<TypeTupleDescriptor> typeRef = new AtomicReference<>();

        assertThat(module.getTypeAliasDeclarations())
            .as("type alias declaration for tuple type exists")
            .anySatisfy((t) -> {
                assertThat(t.getName()).isEqualTo("typeTuple");
                typeRef.set((TypeTupleDescriptor) t.getType());
            });

        TypeTupleDescriptor type = typeRef.get();

        assertThat(type.getItemTypes())
            .as("tuple type has correctly defined item types")
            .hasSize(2)
            .anySatisfy((i) -> {
                assertThat(i)
                    .isInstanceOf(TypeTupleContainsDescriptor.class)
                    .hasFieldOrPropertyWithValue("index", 0)
                    .extracting("item")
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "string");
            })
            .anySatisfy((i) -> {
                assertThat(i)
                    .isInstanceOf(TypeTupleContainsDescriptor.class)
                    .hasFieldOrPropertyWithValue("index", 1)
                    .extracting("item")
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
            });

        return this;
    }

}
