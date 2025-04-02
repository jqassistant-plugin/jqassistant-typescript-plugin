package org.jqassistant.plugin.typescript.api.report;

import com.buschmais.jqassistant.core.report.api.SourceProvider;
import com.buschmais.jqassistant.core.report.api.model.Language;
import com.buschmais.jqassistant.core.report.api.model.LanguageElement;
import com.buschmais.jqassistant.core.report.api.model.source.FileLocation;
import org.jqassistant.plugin.typescript.api.model.core.*;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Optional;

/**
 * Defines the language elements for "TypeScript".
 */
@Language
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface TypeScript {

    TypeScriptElement value();

    enum TypeScriptElement implements LanguageElement {
        Module {
            @Override
            public SourceProvider<ModuleDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(ModuleDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(ModuleDescriptor descriptor) {
                        FileLocation.FileLocationBuilder builder = FileLocation.builder();
                        builder.fileName(descriptor.getGlobalFqn());
                        return Optional.of(builder.build());
                    }
                };
            }
        },
        TypeAliasDeclaration {
            @Override
            public SourceProvider<TypeAliasDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(TypeAliasDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(TypeAliasDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        ClassDeclaration {
            @Override
            public SourceProvider<ClassDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(ClassDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(ClassDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        ConstructorDeclaration {
            @Override
            public SourceProvider<ConstructorDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(ConstructorDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(ConstructorDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        MethodDeclaration {
            @Override
            public SourceProvider<MethodDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(MethodDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(MethodDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        PropertyDeclaration {
            @Override
            public SourceProvider<PropertyDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(PropertyDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(PropertyDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        // TODO: Add Source Location Support for Accessors (requires reference to AccessorProperty from Getter/Setter/AutoAccessor)
        ParameterDeclaration {
            @Override
            public SourceProvider<ParameterDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(ParameterDeclarationDescriptor descriptor) {
                        // TODO: Add information about containing construct
                        return descriptor.getName();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(ParameterDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        InterfaceDeclaration {
            @Override
            public SourceProvider<InterfaceDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(InterfaceDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(InterfaceDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        EnumDeclaration {
            @Override
            public SourceProvider<EnumDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(EnumDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(EnumDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        EnumMember {
            @Override
            public SourceProvider<EnumMemberDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(EnumMemberDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(EnumMemberDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        FunctionDeclaration {
            @Override
            public SourceProvider<FunctionDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(FunctionDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(FunctionDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        },
        VariableDeclaration {
            @Override
            public SourceProvider<VariableDeclarationDescriptor> getSourceProvider() {
                return new SourceProvider<>() {
                    @Override
                    public String getName(VariableDeclarationDescriptor descriptor) {
                        return descriptor.getLocalFqn();
                    }

                    @Override
                    public Optional<FileLocation> getSourceLocation(VariableDeclarationDescriptor descriptor) {
                        return TypeScriptElement.getCodeCoordinateFileLocation(descriptor);
                    }
                };
            }
        };

        @Override
        public String getLanguage() {
            return "TypeScript";
        }

        private static Optional<FileLocation> getCodeCoordinateFileLocation(CodeCoordinateDescriptor descriptor) {
            FileLocation.FileLocationBuilder builder = FileLocation.builder();
            builder.fileName(descriptor.getFileName());
            builder.startLine(Optional.of(descriptor.getStartLine()));
            builder.endLine(Optional.of(descriptor.getEndLine()));
            return Optional.of(builder.build());
        }
    }
}
