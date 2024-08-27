import { ConceptMap } from "../concept";
import { ProcessingContext } from "../context";
import { ProcessorMap } from "../processor";
import { Traverser } from "../traverser";

export class TypeAliasDeclarationTraverser extends Traverser {
    public static readonly TYPE_PARAMETERS_PROP = "type-parameters";

    public traverseChildren(processingContext: ProcessingContext, processors: ProcessorMap): ConceptMap {
        return new Map();
    }
}
