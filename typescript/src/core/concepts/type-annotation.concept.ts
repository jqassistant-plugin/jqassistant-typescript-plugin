import { LCEConcept } from "../concept";

/**
 * Marker concept to mark the usage von indexed access types. (e.g. `const a: { x: someType["prop"]}`)
 * This is used to prevent infinite recursion when resolving the native types of recursively defined indexed access types.
 */
export class LCEIndexAccessTypeAnnotation extends LCEConcept {
    public static override conceptId = "indexed-access-type-annotation";
}
