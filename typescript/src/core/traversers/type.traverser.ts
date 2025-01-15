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

// TODO: implement traversal of other type constructs
// TSFunctionType
// TSConditionalType
// TSConstructorType
// TSImportType
// TSIndexedAccessType
// TSInferType
// TSIntrinsicKeyword
// TSLiteralType
// TSMappedType
// TSNamedTupleMember
// TSNeverKeyword
// TSOptionalType
// TSQualifiedName
// TSRestType
// TSTemplateLiteralType
// TSTypeLiteral
// TSTypeOperator
// TSTypePredicate
// TSTypeQuery
