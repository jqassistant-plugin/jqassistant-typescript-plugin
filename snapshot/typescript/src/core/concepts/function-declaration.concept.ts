import { LCENamedConcept } from "../concept";
import { LCEParameterDeclaration } from "./method-declaration.concept";
import { LCETypeParameterDeclaration } from "./type-parameter.concept";
import { LCEType } from "./type.concept";
import { CodeCoordinates } from "./code-coordinate.concept";
import { FQN } from "../context";

export class LCEFunctionDeclaration extends LCENamedConcept {
    public static override conceptId = "function-declaration";

    constructor(
        public functionName: string,
        fqn: FQN,
        public parameters: LCEParameterDeclaration[],
        public returnType: LCEType,
        public async: boolean,
        public typeParameters: LCETypeParameterDeclaration[],
        public coordinates: CodeCoordinates,
    ) {
        super(fqn);
    }
}
