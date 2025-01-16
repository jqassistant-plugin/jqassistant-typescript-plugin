import { Traverser } from "../traverser";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { ConceptMap, mergeConceptMaps } from "../concept";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { runTraverserForNode, runTraverserForNodes } from "../utils/traverser.utils";

export class TypeAnnotationTraverser extends Traverser {
    public static readonly TYPE_PROP = "type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeAnnotation) {
            runTraverserForNode(
                node.typeAnnotation,
                { parentPropName: TypeAnnotationTraverser.TYPE_PROP },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypeReferenceTraverser extends Traverser {
    public static readonly TYPE_ARGUMENTS_PROP = "type-arguments";
    public static readonly TYPE_NAME_PROP = "type-name";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeReference) {
            if (node.typeArguments)
                runTraverserForNode(
                    node.typeArguments,
                    {
                        parentPropName: TypeReferenceTraverser.TYPE_ARGUMENTS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            runTraverserForNode(node.typeName, { parentPropName: TypeReferenceTraverser.TYPE_NAME_PROP }, processingContext, processors, conceptMaps);
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class UnionTypeTraverser extends Traverser {
    public static readonly TYPES_PROP = "types";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSUnionType) {
            runTraverserForNodes(
                node.types,
                {
                    parentPropName: UnionTypeTraverser.TYPES_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class IntersectionTypeTraverser extends Traverser {
    public static readonly TYPES_PROP = "types";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSIntersectionType) {
            runTraverserForNodes(
                node.types,
                {
                    parentPropName: IntersectionTypeTraverser.TYPES_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TupleTypeTraverser extends Traverser {
    public static readonly ELEMENT_TYPES_PROP = "element-types";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTupleType) {
            runTraverserForNodes(
                node.elementTypes,
                {
                    parentPropName: TupleTypeTraverser.ELEMENT_TYPES_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ArrayTypeTraverser extends Traverser {
    public static readonly ELEMENT_TYPE_PROP = "element-type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSArrayType) {
            runTraverserForNode(
                node.elementType,
                {
                    parentPropName: ArrayTypeTraverser.ELEMENT_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class FunctionTypeTraverser extends Traverser {
    public static readonly RETURN_TYPE_PROP = "return-type";
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSFunctionType) {
            if (node.returnType)
                runTraverserForNode(
                    node.returnType,
                    {
                        parentPropName: FunctionTypeTraverser.RETURN_TYPE_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            if (node.typeParameters)
                runTraverserForNode(
                    node.typeParameters,
                    {
                        parentPropName: FunctionTypeTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            runTraverserForNodes(
                node.params,
                {
                    parentPropName: FunctionTypeTraverser.PARAMETERS_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ConditionalTypeTraverser extends Traverser {
    public static readonly CHECK_TYPE_PROP = "check-type";
    public static readonly EXTENDS_TYPE_PROP = "extends-type";
    public static readonly TRUE_TYPE_PROP = "true-type";
    public static readonly FALSE_TYPE_PROP = "false-type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSConditionalType) {
            runTraverserForNode(
                node.checkType,
                {
                    parentPropName: ConditionalTypeTraverser.CHECK_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            runTraverserForNode(
                node.extendsType,
                {
                    parentPropName: ConditionalTypeTraverser.EXTENDS_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            runTraverserForNode(
                node.trueType,
                {
                    parentPropName: ConditionalTypeTraverser.TRUE_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            runTraverserForNode(
                node.falseType,
                {
                    parentPropName: ConditionalTypeTraverser.FALSE_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ConstructorTypeTraverser extends Traverser {
    public static readonly RETURN_TYPE_PROP = "return-type";
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";
    public static readonly PARAMETERS_PROP = "parameters";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSConstructorType) {
            if (node.returnType)
                runTraverserForNode(
                    node.returnType,
                    {
                        parentPropName: ConstructorTypeTraverser.RETURN_TYPE_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            if (node.typeParameters)
                runTraverserForNode(
                    node.typeParameters,
                    {
                        parentPropName: ConstructorTypeTraverser.TYPE_PARAMETERS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
            runTraverserForNodes(
                node.params,
                {
                    parentPropName: ConstructorTypeTraverser.PARAMETERS_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class ImportTypeTraverser extends Traverser {
    public static readonly TYPE_ARGUMENTS_PROP = "type-arguments";
    public static readonly ARGUMENT_PROP = "argument";
    public static readonly QUALIFIER_PROP = "qualifier";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSImportType) {
            if (node.typeArguments)
                runTraverserForNode(
                    node.typeArguments,
                    {
                        parentPropName: ImportTypeTraverser.TYPE_ARGUMENTS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );

            runTraverserForNode(
                node.argument,
                {
                    parentPropName: ImportTypeTraverser.ARGUMENT_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );

            if (node.qualifier)
                runTraverserForNode(
                    node.qualifier,
                    {
                        parentPropName: ImportTypeTraverser.QUALIFIER_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class IndexedAccessTypeTraverser extends Traverser {
    public static readonly INDEX_TYPE_PROP = "index-type";
    public static readonly OBJECT_TYPE_PROP = "object-type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSIndexedAccessType) {
            runTraverserForNode(
                node.indexType,
                {
                    parentPropName: IndexedAccessTypeTraverser.INDEX_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            runTraverserForNode(
                node.objectType,
                {
                    parentPropName: IndexedAccessTypeTraverser.OBJECT_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class InferTypeTraverser extends Traverser {
    public static readonly TYPE_PARAMETER_PROP = "type-parameter";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSInferType) {
            runTraverserForNode(
                node.typeParameter,
                {
                    parentPropName: InferTypeTraverser.TYPE_PARAMETER_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

/**
 * Note: Don't confuse with `TypeLiteralTraverser`
 */
export class LiteralTypeTraverser extends Traverser {
    public static readonly LITERAL_PROP = "literal";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSLiteralType) {
            runTraverserForNode(
                node.literal,
                {
                    parentPropName: LiteralTypeTraverser.LITERAL_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class MappedTypeTraverser extends Traverser {
    public static readonly NAME_TYPE_PROP = "name-type";
    public static readonly CONSTRAINT_PROP = "constraint";
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSMappedType) {
            if (node.nameType)
                runTraverserForNode(
                    node.nameType,
                    {
                        parentPropName: MappedTypeTraverser.NAME_TYPE_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );

            runTraverserForNode(
                node.constraint,
                {
                    parentPropName: MappedTypeTraverser.CONSTRAINT_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );

            if (node.typeAnnotation)
                runTraverserForNode(
                    node.typeAnnotation,
                    {
                        parentPropName: MappedTypeTraverser.TYPE_ANNOTATION_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class NamedTupleMemberTraverser extends Traverser {
    public static readonly LABEL_PROP = "label";
    public static readonly ELEMENT_TYPE_PROP = "element-type";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSNamedTupleMember) {
            runTraverserForNode(
                node.label,
                {
                    parentPropName: NamedTupleMemberTraverser.LABEL_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );

            runTraverserForNode(
                node.elementType,
                {
                    parentPropName: NamedTupleMemberTraverser.ELEMENT_TYPE_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class OptionalTypeTraverser extends Traverser {
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSOptionalType) {
            runTraverserForNode(
                node.typeAnnotation,
                {
                    parentPropName: OptionalTypeTraverser.TYPE_ANNOTATION_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class QualifiedNameTraverser extends Traverser {
    public static readonly LEFT_PROP = "left";
    public static readonly RIGHT_PROP = "right";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSQualifiedName) {
            runTraverserForNode(
                node.left,
                {
                    parentPropName: QualifiedNameTraverser.LEFT_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            runTraverserForNode(
                node.left,
                {
                    parentPropName: QualifiedNameTraverser.RIGHT_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class RestTypeTraverser extends Traverser {
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSRestType) {
            runTraverserForNode(
                node.typeAnnotation,
                {
                    parentPropName: RestTypeTraverser.TYPE_ANNOTATION_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TemplateLiteralTypeTraverser extends Traverser {
    public static readonly TYPES_PROP = "type-annotation";
    public static readonly QUASIS_PROP = "quasis";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTemplateLiteralType) {
            runTraverserForNodes(
                node.types,
                {
                    parentPropName: TemplateLiteralTypeTraverser.TYPES_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            runTraverserForNodes(
                node.quasis,
                {
                    parentPropName: TemplateLiteralTypeTraverser.QUASIS_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

/**
 * Note: Don't confuse with `LiteralTypeTraverser`
 */
export class TypeLiteralTraverser extends Traverser {
    public static readonly MEMBERS_PROP = "members";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeLiteral) {
            runTraverserForNodes(
                node.members,
                {
                    parentPropName: TypeLiteralTraverser.MEMBERS_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypeOperatorTraverser extends Traverser {
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeOperator) {
            if (node.typeAnnotation)
                runTraverserForNode(
                    node.typeAnnotation,
                    {
                        parentPropName: TypeOperatorTraverser.TYPE_ANNOTATION_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypePredicateTraverser extends Traverser {
    public static readonly PARAMETER_NAME_PROP = "parameter-name";
    public static readonly TYPE_ANNOTATION_PROP = "type-annotation";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypePredicate) {
            runTraverserForNode(
                node.parameterName,
                {
                    parentPropName: TypePredicateTraverser.PARAMETER_NAME_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            if (node.typeAnnotation)
                runTraverserForNode(
                    node.typeAnnotation,
                    {
                        parentPropName: TypePredicateTraverser.TYPE_ANNOTATION_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}

export class TypeQueryTraverser extends Traverser {
    public static readonly EXPR_NAME_PROP = "expr-name";
    public static readonly TYPE_ARGUMENTS_PROP = "type-arguments";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        const { node } = processingContext;
        const conceptMaps: ConceptMap[] = [];

        if (node.type === AST_NODE_TYPES.TSTypeQuery) {
            runTraverserForNode(
                node.exprName,
                {
                    parentPropName: TypeQueryTraverser.EXPR_NAME_PROP,
                },
                processingContext,
                processors,
                conceptMaps,
            );
            if (node.typeArguments)
                runTraverserForNode(
                    node.typeArguments,
                    {
                        parentPropName: TypeQueryTraverser.TYPE_ARGUMENTS_PROP,
                    },
                    processingContext,
                    processors,
                    conceptMaps,
                );
        }

        return mergeConceptMaps(...conceptMaps);
    }
}
