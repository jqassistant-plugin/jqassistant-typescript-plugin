import { LCENamedConcept } from "../concept";
import { LCEMethodDeclaration } from "./method-declaration.concept";
import { LCEPropertyDeclaration } from "./property-declaration.concept";
import { LCETypeParameterDeclaration } from "./type-parameter.concept";
import { LCETypeDeclared } from "./type.concept";
import { CodeCoordinates } from "./code-coordinate.concept";
import { LCEAccessorProperty } from "./accessor-declaration.concept";

export class LCEInterfaceDeclaration extends LCENamedConcept {
    public static override conceptId = "interface-declaration";

    constructor(
        public interfaceName: string,
        fqn: string,
        public typeParameters: LCETypeParameterDeclaration[],
        public extendsInterfaces: LCETypeDeclared[],
        public properties: LCEPropertyDeclaration[],
        public methods: LCEMethodDeclaration[],
        public accessor: LCEAccessorProperty[],
        public coordinates: CodeCoordinates,
    ) {
        super(fqn);
    }
}
