import { LCEProject } from "./project";

/**
 *  Post-processes the set of all extracted concepts on a cross-project or per-project basis.
 *  Can be used to modify or add language concepts based on existing ones.
 */
export abstract class PostProcessor {

    /**
     * Modifies or adds language concepts of the provided projects in-place.
     *
     * @param projects list of all processed projects
     */
    public abstract postProcess(projects: LCEProject[]): void;

}
