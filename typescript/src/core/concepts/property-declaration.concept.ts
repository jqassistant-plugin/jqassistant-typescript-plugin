import {LCENamedConcept} from "../concept";
import {LCEDecorator} from "./decorator.concept";
import {LCEType} from "./type.concept";
import {Visibility} from "./visibility.concept";

export class LCEPropertyDeclaration extends LCENamedConcept {
    public static override conceptId = "property-declaration";

    constructor(
        public propertyName: string,
        fqn: string,
        public optional: boolean,
        public type: LCEType,
        public decorators: LCEDecorator[],
        public visibility: Visibility,
        public readonly: boolean,
        public override?: boolean,
        public abstract?: boolean,
        public isStatic?: boolean
    ) {
        super(fqn);
    }
}
