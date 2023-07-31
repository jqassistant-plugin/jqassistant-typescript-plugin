import {ConceptMap, LCEConcept} from "./concept";
import {LCEValue, valueConceptIds} from "./concepts/value.concept";
import {LocalContexts} from "./context";
import {Traverser, TraverserContext} from "./traverser";

export function getAndDeleteChildConcepts<T extends LCEConcept>(propName: string, conceptId: string, childConcepts: ConceptMap): T[] {
    const propConcepts = childConcepts.get(propName);
    if (!propConcepts) return [];

    const result = propConcepts.get(conceptId) ?? [];
    propConcepts.delete(conceptId);
    if (propConcepts.size == 0) childConcepts.delete(propName);
    return result as T[];
}

export function getAndDeleteAllValueChildConcepts(propName: string, childConcepts: ConceptMap): LCEValue[] {
    const values: LCEConcept[] = [];
    for (const conceptId of valueConceptIds) {
        values.push(...getAndDeleteChildConcepts(propName, conceptId, childConcepts));
    }
    return values as LCEValue[];
}

export function getChildConcepts<T extends LCEConcept>(propName: string, conceptId: string, childConcepts: ConceptMap): T[] {
    const propConcepts = childConcepts.get(propName);
    if (!propConcepts) return [];
    const result = propConcepts.get(conceptId) ?? [];
    return result as T[];
}

export function getParentPropName(localContexts: LocalContexts): string {
    const traverserContext = localContexts.currentContexts.get(Traverser.LOCAL_TRAVERSER_CONTEXT) as TraverserContext;
    if (!traverserContext) throw new Error("No traverser context found");
    return traverserContext.parentPropName;
}

export function getParentPropIndex(localContexts: LocalContexts): number | undefined {
    const traverserContext = localContexts.currentContexts.get(Traverser.LOCAL_TRAVERSER_CONTEXT) as TraverserContext;
    if (!traverserContext) throw new Error("No traverser context found");
    return traverserContext.parentPropIndex;
}
