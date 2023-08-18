import { LCEConcept, LCENamedConcept } from "../concept";
import { LCEDecorator } from "./decorator.concept";
import { Visibility } from "./visibility.concept";
import { CodeCoordinates } from "./code-coordinate.concept";
import { LCEType } from "./type.concept";
import { LCEParameterDeclaration } from "./method-declaration.concept";

export class LCEAccessorProperty extends LCENamedConcept {
    public static override conceptId = "accessor";

    constructor(
        fqn: string,
        public accessorName: string,
        public getter?: LCEGetterDeclaration,
        public setter?: LCESetterDeclaration,
        public autoAccessor?: LCEAutoAccessorDeclaration,
    ) {
        super(fqn);
    }
}

export class LCEGetterDeclaration extends LCEConcept{
    public static override conceptId = "getter-declaration";

    constructor(
        public returnType: LCEType,
        public decorators: LCEDecorator[],
        public visibility: Visibility,
        public coordinates: CodeCoordinates,
        public override?: boolean,
        public abstract?: boolean,
        public isStatic?: boolean
    ) {
        super();
    }
}

export class LCESetterDeclaration extends LCEConcept {
    public static override conceptId = "setter-declaration";

    constructor(
        public parameters: LCEParameterDeclaration[],
        public decorators: LCEDecorator[],
        public visibility: Visibility,
        public coordinates: CodeCoordinates,
        public override?: boolean,
        public abstract?: boolean,
        public isStatic?: boolean
    ) {
        super();
    }
}

export class LCEAutoAccessorDeclaration extends LCEConcept{
    public static override conceptId = "auto-accessor-declaration";

    constructor(
        public type: LCEType,
        public decorators: LCEDecorator[],
        public visibility: Visibility,
        public coordinates: CodeCoordinates,
        public override?: boolean,
        public abstract?: boolean,
        public isStatic?: boolean
    ) {
        super();
    }
}
