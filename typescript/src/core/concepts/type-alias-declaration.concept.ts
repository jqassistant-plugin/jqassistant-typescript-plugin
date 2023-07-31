import {LCENamedConcept} from "../concept";
import {LCETypeParameterDeclaration} from "./type-parameter.concept";
import {LCEType} from "./type.concept";
import {CodeCoordinates} from "./code-coordinate.concept";

export class LCETypeAliasDeclaration extends LCENamedConcept {
    public static override conceptId = "type-alias-declaration";

    constructor(
        public typeAliasName: string,
        fqn: string,
        public typeParameters: LCETypeParameterDeclaration[],
        public type: LCEType,
        public coordinates: CodeCoordinates
    ) {
        super(fqn);
    }
}
