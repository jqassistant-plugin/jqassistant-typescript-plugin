import { LCENamedConcept } from "../concept";
import { LCEDecorator } from "./decorator.concept";
import { LCEConstructorDeclaration, LCEMethodDeclaration } from "./method-declaration.concept";
import { LCEPropertyDeclaration } from "./property-declaration.concept";
import { LCETypeParameterDeclaration } from "./type-parameter.concept";
import { LCETypeDeclared } from "./type.concept";
import { CodeCoordinates } from "./code-coordinate.concept";
import { LCEAccessorProperty } from "./accessor-declaration.concept";

export class LCEClassDeclaration extends LCENamedConcept {
    public static override conceptId = "class-declaration";

    constructor(
        public className: string,
        fqn: string,
        public abstract: boolean,
        public typeParameters: LCETypeParameterDeclaration[],
        public extendsClass: LCETypeDeclared | undefined,
        public implementsInterfaces: LCETypeDeclared[],
        public constr: LCEConstructorDeclaration | undefined,
        public properties: LCEPropertyDeclaration[],
        public methods: LCEMethodDeclaration[],
        public accessorProperties: LCEAccessorProperty[],
        public decorators: LCEDecorator[],
        public coordinates: CodeCoordinates,
    ) {
        super(fqn);
    }
}
