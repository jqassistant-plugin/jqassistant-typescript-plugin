import { FQN } from "./context";

/**
 * Base class for all language concepts.
 */
export abstract class LCEConcept {
    /**
     * Unique identifier for a concept class.
     * Should be set by subclasses.
     */
    public static conceptId: string;

    /**
     * Contains metadata that may be used by Processors further up the AST, or by Post-Processors.
     * NOTE: metadata should not be used in the toJSON method, as Concept classes should not contain any processing logic.
     */
    public metadata: Map<string, any> = new Map();

    /**
     * Returns a JSON object that contains all the information that should be present in the JSON report that is used for graph generation.
     * NOTE: This method should not contain any processing logic!
     *
     * Returns all fields, except metadata by default. Also calls toJSON for all fields that are concepts, or concept arrays.
     */
    public toJSON(): object {
        const jsonObject: any = {};

        Object.entries(this).forEach(([key, value]) => {
            if (value instanceof LCEConcept) {
                jsonObject[key] = value.toJSON();
            } else if (Array.isArray(value) && value.every(item => item instanceof LCEConcept)) {
                jsonObject[key] = value.map(item => item.toJSON());
            } else if (key === "fqn" && value instanceof FQN) {
                jsonObject["globalFqn"] = value.globalFqn;
                jsonObject["localFqn"] = value.localFqn;
            } else if (key !== 'metadata') {
                jsonObject[key] = value;
            }
        });

        return jsonObject;
    };
}

/**
 * Base class for all language concepts that can be referred to by a fully qualified name.
 */
export abstract class LCENamedConcept extends LCEConcept {
    protected constructor(public fqn: FQN) {
        super();
    }
}

export function isNamedConcept(concept: LCEConcept): concept is LCENamedConcept {
    return "globalFqn" in concept && "localFqn" in concept;
}

/**
 * Represents a set of language concepts identified by their child concept id given by their parent, and their concept id representing their type.
 *
 * Key Structure: conceptMap.get(parentPropName).get(conceptId)
 * */
export type ConceptMap = Map<string, Map<string, LCEConcept[]>>;

/**
 * Merges the given ConceptMaps. Array values of the same keys are concatenated.
 */
export function mergeConceptMaps(...maps: ConceptMap[]): ConceptMap {
    const result: ConceptMap = new Map();
    for (const map of maps) {
        for (const [kO, vMap] of map.entries()) {
            const outerRes = result.get(kO);
            if (!outerRes) {
                result.set(kO, vMap);
                continue;
            }
            for (const [kI, vArr] of vMap.entries()) {
                const innerRes = outerRes.get(kI);
                if (innerRes) {
                    outerRes.set(kI, innerRes.concat(vArr));
                } else {
                    outerRes.set(kI, vArr);
                }
            }
        }
    }
    return result;
}

/**
 * takes all concepts and their conceptIds and unifies them under a single outer common key
 * @returns a ConceptMap with a single key which maps to all concepts contained in the original map
 */
export function unifyConceptMap(conceptMap: ConceptMap, commonKey: string): ConceptMap {
    const result: ConceptMap = new Map();
    let innerMap = result.get(commonKey);
    for (const [, vMap] of conceptMap.entries()) {
        if (innerMap) {
            for (const [kI, vArr] of vMap.entries()) {
                const innerRes = innerMap.get(kI);
                if (innerRes) {
                    innerMap.set(kI, innerRes.concat(vArr));
                } else {
                    innerMap.set(kI, vArr);
                }
            }
        } else {
            result.set(commonKey, vMap);
            innerMap = vMap;
        }
    }
    return result;
}

/**
 * creates a ConceptMap containing a single concept
 */
export function singleEntryConceptMap(conceptId: string, concept: LCEConcept, parentPropName = ""): ConceptMap {
    return createConceptMap(conceptId, [concept], parentPropName);
}

/**
 * creates a ConceptMap containing a list of concepts of one concept type for a single parent property
 */
export function createConceptMap(conceptId: string, concepts: LCEConcept[], parentPropName = ""): ConceptMap {
    return new Map([[parentPropName, new Map([[conceptId, concepts]])]]);
}

/**
 * retrieves an array of concepts from a ConceptMap entry and casts it to the provided type
 */
export function getAndCastConcepts<T extends LCEConcept>(conceptId: string, concepts: Map<string, LCEConcept[]>): T[] {
    return concepts.has(conceptId) ? (concepts.get(conceptId) as T[]) : [];
}
