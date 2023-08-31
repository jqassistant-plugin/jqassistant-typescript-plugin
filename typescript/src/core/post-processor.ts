import { LCEConcept } from "./concept";

/**
 *  Post-processes the set of all extracted concepts on a project-wide basis.
 *  Can be used to modify or add language concepts based on existing ones.
 */
export abstract class PostProcessor {

    /**
     * Modifies or adds language concepts of the provided concept map in-place.
     *
     * @param concepts normalized map of all extracted language concepts of a project (keys are conceptIds)
     */
    public abstract postProcess(concepts: Map<string, LCEConcept[]>, projectRootPath: string): void;

}
