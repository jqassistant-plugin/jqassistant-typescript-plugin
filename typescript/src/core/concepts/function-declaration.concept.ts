import {LCENamedConcept} from "../concept";
import {LCEParameterDeclaration} from "./method-declaration.concept";
import {LCETypeParameterDeclaration} from "./type-parameter.concept";
import {LCEType} from "./type.concept";

export class LCEFunctionDeclaration extends LCENamedConcept {
    public static override conceptId = "function-declaration";

    constructor(
        public functionName: string,
        fqn: string,
        public parameters: LCEParameterDeclaration[],
        public returnType: LCEType,
        public typeParameters: LCETypeParameterDeclaration[],
        public sourceFilePath: string
    ) {
        super(fqn);
    }
}
