/**
 * Represents an area within a source file which corresponds to an extracted language concept.
 * The file name should be an absolute path.
 */
export class CodeCoordinates {
    constructor(public fileName?: string,
                public startLine?: number,
                public startColumn? : number,
                public endLine?: number,
                public endColumn?: number) {
    }
}
