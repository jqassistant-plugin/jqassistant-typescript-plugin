import { LCENamedConcept } from "../concept";
import { LCEMethodDeclaration } from "./method-declaration.concept";
import { LCEPropertyDeclaration } from "./property-declaration.concept";
import { LCETypeParameterDeclaration } from "./type-parameter.concept";
import { LCETypeDeclared } from "./type.concept";
import { CodeCoordinates } from "./code-coordinate.concept";
import { LCEAccessorProperty } from "./accessor-declaration.concept";
import { FQN } from "../context";

export class LCEInterfaceDeclaration extends LCENamedConcept {
    public static override conceptId = "interface-declaration";

    constructor(
        public interfaceName: string,
        fqn: FQN,
        public typeParameters: LCETypeParameterDeclaration[],
        public extendsInterfaces: LCETypeDeclared[],
        public properties: LCEPropertyDeclaration[],
        public methods: LCEMethodDeclaration[],
        public accessorProperties: LCEAccessorProperty[],
        public coordinates: CodeCoordinates,
    ) {
        super(fqn);
    }
}
