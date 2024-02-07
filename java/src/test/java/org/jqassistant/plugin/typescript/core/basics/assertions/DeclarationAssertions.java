package org.jqassistant.plugin.typescript.core.basics.assertions;

import org.assertj.core.api.InstanceOfAssertFactories;
import org.jqassistant.plugin.typescript.api.model.core.*;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

public class DeclarationAssertions {

    ProjectDescriptor project;
    ModuleDescriptor module;

    public DeclarationAssertions(ProjectDescriptor projectDescriptor) {
        this.project = projectDescriptor;
    }

    public DeclarationAssertions assertModulePresence() {
        Optional<ModuleDescriptor> moduleDescriptorOptional = project.getModules().stream()
            .filter((mod) -> mod.getGlobalFqn().equals("/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts"))
            .findFirst();

        assertThat(moduleDescriptorOptional.isPresent())
            .as("declarations module is present")
            .isTrue();

        assertThat(moduleDescriptorOptional.get().getLocalFqn())
            .as("declaration module has correct local FQN")
            .isEqualTo("./src/testDeclarations.ts");

        moduleDescriptorOptional.ifPresent(moduleDescriptor -> this.module = moduleDescriptor);

        return this;
    }

    public DeclarationAssertions assertVariableDeclaration() {
        assertThat(module.getVariableDeclarations())
            .as("declarations module only has one variable declaration")
            .hasSize(1);

        VariableDeclarationDescriptor decl = module.getVariableDeclarations().get(0);

        assertThat(decl)
            .as("variable declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".CONSTANT")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".CONSTANT")
            .hasFieldOrPropertyWithValue("name", "CONSTANT")
            .hasFieldOrPropertyWithValue("kind", "const");

        assertThat(decl.getType())
            .as("variable declaration type has correct type")
            .isNotNull()
            .isInstanceOf(TypeLiteralDescriptor.class);

        assertThat(decl.getInitValue())
            .as("variable declaration init value is not null")
            .isNotNull();

        return this;
    }

    public DeclarationAssertions assertFunctionDeclaration() {
        assertThat(module.getFunctionDeclarations())
            .as("declarations module only has one function declaration")
            .hasSize(1);

        FunctionDeclarationDescriptor decl = module.getFunctionDeclarations().get(0);

        assertThat(decl)
            .as("function declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".func")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".func")
            .hasFieldOrPropertyWithValue("name", "func")
            .hasFieldOrPropertyWithValue("async", false);

        assertThat(decl.getReturnType())
            .as("function declaration return type has correct type")
            .isNotNull()
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .extracting("name")
                .isEqualTo("void");

        assertThat(decl.getTypeParameters())
            .as("function declaration has two type parameters that are defined correctly")
            .hasSize(2)
            .anySatisfy((tp) -> {
                assertThat(tp)
                    .hasFieldOrPropertyWithValue("name", "T")
                    .hasFieldOrPropertyWithValue("index", 0);
                assertThat(tp.getConstraint())
                    .isInstanceOf(TypeObjectDescriptor.class)
                    .extracting("members", InstanceOfAssertFactories.LIST)
                        .hasSize(0);
            })
            .anySatisfy((tp) -> {
                assertThat(tp)
                    .hasFieldOrPropertyWithValue("name", "U")
                    .hasFieldOrPropertyWithValue("index", 1);
                assertThat(tp.getConstraint())
                    .isInstanceOf(TypeDeclaredDescriptor.class)
                    .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseInterface")
                    .extracting("typeArguments", InstanceOfAssertFactories.LIST)
                        .hasSize(0);
            });

        assertThat(decl.getParameters())
            .as("function declaration has two parameters that are defined correctly")
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
                    .isEqualTo("string");
            });
        return this;
    }

    public DeclarationAssertions assertClassDeclaration() {
        assertThat(module.getClassDeclarations())
            .as("declarations module only has one class declaration")
            .hasSize(1);

        ClassDeclarationDescriptor decl = module.getClassDeclarations().get(0);

        assertThat(decl)
            .as("class declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Class")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Class")
            .hasFieldOrPropertyWithValue("name", "Class")
            .hasFieldOrPropertyWithValue("abstract", false);

        assertThat(decl.getExtendsClass())
            .as("class declaration has extends relationship set correctly")
            .isNotNull()
            .isInstanceOf(TypeDeclaredDescriptor.class)
            .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseClass")
            .extracting("typeArguments", InstanceOfAssertFactories.LIST)
                .hasSize(0);

        assertThat(decl.getImplementsInterfaces())
            .as("class declaration has implements relationships set correctly")
            .hasSize(1)
            .first()
            .isInstanceOf(TypeDeclaredDescriptor.class)
            .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseInterface")
            .extracting("typeArguments", InstanceOfAssertFactories.LIST)
                .hasSize(0);

        // TODO: wait for bugfix in XO
//        assertThat(decl.getConstructor())
//            .as("class declaration has constructor that is defined correctly")
//            .isNotNull()
//            .hasFieldOrPropertyWithValue("fqn", "\"./src/testDeclarations.ts\".Class.constructor")
//            .extracting("parameters", InstanceOfAssertFactories.LIST)
//            .hasSize(3);

        assertThat(decl.getProperties())
            .as("class declaration has properties that are defined correctly")
            .hasSize(2)
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Class.x")
                    .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Class.x")
                    .hasFieldOrPropertyWithValue("name", "x")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false)
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", false)
                    .hasFieldOrPropertyWithValue("abstract", false)
                    .hasFieldOrPropertyWithValue("override", false)
                    .extracting("type")
                        .isInstanceOf(TypePrimitiveDescriptor.class)
                        .extracting("name")
                            .isEqualTo("number");
                assertThat(p.getDecorators())
                    .hasSize(0);
            })
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Class.z")
                    .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Class.z")
                    .hasFieldOrPropertyWithValue("name", "z")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false)
                    .hasFieldOrPropertyWithValue("visibility", "protected")
                    .hasFieldOrPropertyWithValue("static", false)
                    .hasFieldOrPropertyWithValue("abstract", false)
                    .hasFieldOrPropertyWithValue("override", false)
                    .extracting("type")
                        .isInstanceOf(TypePrimitiveDescriptor.class)
                        .extracting("name")
                            .isEqualTo("number");
                assertThat(p.getDecorators())
                    .hasSize(0);
            });

        assertThat(decl.getAccessorProperties())
            .as("class declaration has accessor properties that are defined correctly")
            .hasSize(2)
            .anySatisfy((a) -> {
                assertThat(a.getGlobalFqn()).isEqualTo("\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Class.y");
                assertThat(a.getLocalFqn()).isEqualTo("\"./src/testDeclarations.ts\".Class.y");
                assertThat(a.getName()).isEqualTo("y");
                assertThat(a.getAutoAccessor()).isNull();
                assertThat(a.getGetter())
                    .isNotNull()
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", false)
                    .hasFieldOrPropertyWithValue("abstract", false)
                    .hasFieldOrPropertyWithValue("override", false)
                    .extracting("returnType")
                        .isInstanceOf(TypePrimitiveDescriptor.class)
                        .hasFieldOrPropertyWithValue("name", "number");
                assertThat(a.getGetter().getDecorators()).hasSize(0);
                assertThat(a.getSetter())
                    .isNotNull()
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", false)
                    .hasFieldOrPropertyWithValue("abstract", false)
                    .hasFieldOrPropertyWithValue("override", false)
                    .extracting("parameters", InstanceOfAssertFactories.LIST)
                        .hasSize(1)
                        .first()
                        .hasFieldOrPropertyWithValue("name", "newY")
                        .hasFieldOrPropertyWithValue("index", 0)
                        .hasFieldOrPropertyWithValue("optional", false);
                assertThat(a.getSetter().getDecorators()).hasSize(0);
            })
            .anySatisfy((a) -> {
                assertThat(a.getGlobalFqn()).isEqualTo("\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Class.w");
                assertThat(a.getLocalFqn()).isEqualTo("\"./src/testDeclarations.ts\".Class.w");
                assertThat(a.getName()).isEqualTo("w");
                assertThat(a.getAutoAccessor())
                    .isNotNull()
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", false)
                    .hasFieldOrPropertyWithValue("abstract", false)
                    .hasFieldOrPropertyWithValue("override", false)
                    .extracting("type")
                        .isInstanceOf(TypePrimitiveDescriptor.class)
                        .extracting("name")
                        .isEqualTo("number");
                assertThat(a.getAutoAccessor().getDecorators())
                    .hasSize(0);
                assertThat(a.getGetter()).isNull();
                assertThat(a.getSetter()).isNull();
            });

        assertThat(decl.getMethods())
            .as("class declaration has one method")
            .hasSize(1);

        MethodDeclarationDescriptor methodDecl = decl.getMethods().get(0);

        assertThat(methodDecl)
            .as("method declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Class.method")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Class.method")
            .hasFieldOrPropertyWithValue("name", "method")
            .hasFieldOrPropertyWithValue("visibility", "private")
            .hasFieldOrPropertyWithValue("async", false)
            .hasFieldOrPropertyWithValue("static", false)
            .hasFieldOrPropertyWithValue("abstract", false)
            .hasFieldOrPropertyWithValue("override", false);

        assertThat(methodDecl.getReturnType())
            .as("method declaration return type has correct type")
            .isNotNull()
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .extracting("name")
            .isEqualTo("void");

        assertThat(methodDecl.getTypeParameters())
            .as("method declaration has one type parameter that is defined correctly")
            .hasSize(1)
            .anySatisfy((tp) -> {
                assertThat(tp)
                    .hasFieldOrPropertyWithValue("name", "T")
                    .hasFieldOrPropertyWithValue("index", 0);
                assertThat(tp.getConstraint())
                    .isInstanceOf(TypeObjectDescriptor.class)
                    .extracting("members", InstanceOfAssertFactories.LIST)
                    .hasSize(2)
                    .anySatisfy((m) -> {
                        assertThat(m)
                            .hasFieldOrPropertyWithValue("name", "a")
                            .hasFieldOrPropertyWithValue("optional", false)
                            .hasFieldOrPropertyWithValue("readonly", false)
                            .extracting("type")
                                .isInstanceOf(TypePrimitiveDescriptor.class)
                                .extracting("name")
                                    .isEqualTo("number");
                    })
                    .anySatisfy((m) -> {
                        assertThat(m)
                            .hasFieldOrPropertyWithValue("name", "b")
                            .hasFieldOrPropertyWithValue("optional", false)
                            .hasFieldOrPropertyWithValue("readonly", false)
                            .extracting("type")
                            .isInstanceOf(TypePrimitiveDescriptor.class)
                            .extracting("name")
                            .isEqualTo("string");
                    });
            });

        assertThat(methodDecl.getParameters())
            .as("method declaration has two parameters that are defined correctly")
            .hasSize(2)
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("name", "p1")
                    .hasFieldOrPropertyWithValue("index", 0)
                    .hasFieldOrPropertyWithValue("optional", false);
                assertThat(p.getType())
                    .isNotNull()
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .extracting("name")
                    .isEqualTo("boolean");
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
                    .isEqualTo("string");
            });

        return this;
    }

    public DeclarationAssertions assertInterfaceDeclaration() {
        assertThat(module.getInterfaceDeclarations())
            .as("declarations module only has one interface declaration")
            .hasSize(1);

        InterfaceDeclarationDescriptor decl = module.getInterfaceDeclarations().get(0);

        assertThat(decl)
            .as("interface declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Interface")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Interface")
            .hasFieldOrPropertyWithValue("name", "Interface");

        assertThat(decl.getExtendsInterfaces())
            .hasSize(1)
            .first()
            .as("interface declaration has extends relationship set correctly")
            .isNotNull()
            .isInstanceOf(TypeDeclaredDescriptor.class)
            .hasFieldOrPropertyWithValue("referencedGlobalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/utils.ts\".BaseInterface")
            .extracting("typeArguments", InstanceOfAssertFactories.LIST)
            .hasSize(0);

        assertThat(decl.getProperties())
            .as("interface declaration has property that is defined correctly")
            .hasSize(1)
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Interface.prop")
                    .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Interface.prop")
                    .hasFieldOrPropertyWithValue("name", "prop")
                    .hasFieldOrPropertyWithValue("optional", false)
                    .hasFieldOrPropertyWithValue("readonly", false)
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", null)
                    .hasFieldOrPropertyWithValue("abstract", null)
                    .hasFieldOrPropertyWithValue("override", null)
                    .extracting("type")
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .extracting("name")
                    .isEqualTo("string");
                assertThat(p.getDecorators())
                    .hasSize(0);
            });

        assertThat(decl.getAccessorProperties())
            .as("interface declaration has accessor properties that are defined correctly")
            .hasSize(2)
            .anySatisfy((a) -> {
                assertThat(a.getGlobalFqn()).isEqualTo("\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Interface.getter");
                assertThat(a.getLocalFqn()).isEqualTo("\"./src/testDeclarations.ts\".Interface.getter");
                assertThat(a.getName()).isEqualTo("getter");
                assertThat(a.getAutoAccessor()).isNull();
                assertThat(a.getGetter())
                    .isNotNull()
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", null)
                    .hasFieldOrPropertyWithValue("abstract", null)
                    .hasFieldOrPropertyWithValue("override", null)
                    .extracting("returnType")
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .hasFieldOrPropertyWithValue("name", "number");
                assertThat(a.getGetter().getDecorators()).hasSize(0);
                assertThat(a.getSetter()).isNull();
            })
            .anySatisfy((a) -> {
                assertThat(a.getGlobalFqn()).isEqualTo("\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Interface.setter");
                assertThat(a.getLocalFqn()).isEqualTo("\"./src/testDeclarations.ts\".Interface.setter");
                assertThat(a.getName()).isEqualTo("setter");
                assertThat(a.getAutoAccessor()).isNull();
                assertThat(a.getGetter()).isNull();
                assertThat(a.getSetter())
                    .isNotNull()
                    .hasFieldOrPropertyWithValue("visibility", "public")
                    .hasFieldOrPropertyWithValue("static", null)
                    .hasFieldOrPropertyWithValue("abstract", null)
                    .hasFieldOrPropertyWithValue("override", null)
                    .extracting("parameters", InstanceOfAssertFactories.LIST)
                    .hasSize(1)
                    .first()
                    .hasFieldOrPropertyWithValue("name", "value")
                    .hasFieldOrPropertyWithValue("index", 0)
                    .hasFieldOrPropertyWithValue("optional", false);
            });

        assertThat(decl.getMethods())
            .as("interface declaration has one method")
            .hasSize(1);

        MethodDeclarationDescriptor methodDecl = decl.getMethods().get(0);

        assertThat(methodDecl)
            .as("method declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn", "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Interface.method")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Interface.method")
            .hasFieldOrPropertyWithValue("name", "method")
            .hasFieldOrPropertyWithValue("visibility", "public")
            .hasFieldOrPropertyWithValue("async", false)
            .hasFieldOrPropertyWithValue("static", null)
            .hasFieldOrPropertyWithValue("abstract", null)
            .hasFieldOrPropertyWithValue("override", null);

        assertThat(methodDecl.getReturnType())
            .as("method declaration return type has correct type")
            .isNotNull()
            .isInstanceOf(TypePrimitiveDescriptor.class)
            .extracting("name")
            .isEqualTo("boolean");

        assertThat(methodDecl.getTypeParameters())
            .as("method declaration has no type parameters")
            .hasSize(0);

        assertThat(methodDecl.getParameters())
            .as("method declaration has a parameter that is defined correctly")
            .hasSize(1)
            .anySatisfy((p) -> {
                assertThat(p)
                    .hasFieldOrPropertyWithValue("name", "p1")
                    .hasFieldOrPropertyWithValue("index", 0)
                    .hasFieldOrPropertyWithValue("optional", false);
                assertThat(p.getType())
                    .isNotNull()
                    .isInstanceOf(TypePrimitiveDescriptor.class)
                    .extracting("name")
                    .isEqualTo("number");
            });

        return this;
    }

    public DeclarationAssertions assertEnumDeclaration() {
        assertThat(module.getEnumDeclarations())
            .as("declarations module only has one enum declaration")
            .hasSize(1);

        EnumDeclarationDescriptor decl = module.getEnumDeclarations().get(0);

        assertThat(decl)
            .as("enum declaration has all properties set correctly")
            .hasFieldOrPropertyWithValue("globalFqn",  "\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Enum")
            .hasFieldOrPropertyWithValue("localFqn", "\"./src/testDeclarations.ts\".Enum")
            .hasFieldOrPropertyWithValue("name", "Enum")
            .hasFieldOrPropertyWithValue("constant", false)
            .hasFieldOrPropertyWithValue("declared", false);

        assertThat(decl.getMembers())
            .as("enum declaration has two members that are defined correctly")
            .hasSize(2)
            .anySatisfy((em) -> {
                assertThat(em.getGlobalFqn()).isEqualTo("\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Enum.ELEM1");
                assertThat(em.getLocalFqn()).isEqualTo("\"./src/testDeclarations.ts\".Enum.ELEM1");
                assertThat(em.getName()).isEqualTo("ELEM1");
            })
            .anySatisfy((em) -> {
                assertThat(em.getGlobalFqn()).isEqualTo("\"/java/src/test/resources/java-it-core-basics-sample-project/src/testDeclarations.ts\".Enum.ELEM2");
                assertThat(em.getLocalFqn()).isEqualTo("\"./src/testDeclarations.ts\".Enum.ELEM2");
                assertThat(em.getName()).isEqualTo("ELEM2");
            });
        return this;
    }

}
