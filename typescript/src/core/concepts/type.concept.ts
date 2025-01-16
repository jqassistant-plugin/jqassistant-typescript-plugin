import { LCEConcept } from "../concept";
import { LCETypeParameterDeclaration } from "./type-parameter.concept";
import { FQN } from "../context";

/** Base class for all types. */
export abstract class LCEType extends LCEConcept {
    public static override conceptId = "type";
    protected constructor(public type: string) {
        super();
    }
}

/**
 * Represents a primitive type (e.g. `string`)
 */
export class LCETypePrimitive extends LCEType {
    public static override conceptId = "primitive-type";
    public static readonly typeId = "primitive";

        /**
     * @param name identifier of the primitive type
     */
    constructor(public name: string) {
        super(LCETypePrimitive.typeId);
    }
}

/**
 * Represents a type defined by a class, interface or type alias
 */
export class LCETypeDeclared extends LCEType {
    public static override conceptId = "declared-type";
    public static readonly typeId = "declared";

    /**
     * @param fqn fully qualified name of a class/interface/type alias (only uses global FQN)
     * @param typeArguments list of type arguments provided for generics
     */
    constructor(public fqn: FQN, public typeArguments: LCEType[]) {
        super(LCETypeDeclared.typeId);
    }
}

/**
 * Represents an union type (e.g. `string | number`)
 */
export class LCETypeUnion extends LCEType {
    public static override conceptId = "union-type";
    public static readonly typeId = "union";

    /**
     * @param types constituents of the union type
     */
    constructor(public types: LCEType[]) {
        super(LCETypeUnion.typeId);
    }
}

/**
 * Represents an intersection type (e.g. `A & B`)
 */
export class LCETypeIntersection extends LCEType {
    public static override conceptId = "intersection-type";
    public static readonly typeId = "intersection";

    /**
     * @param types constituents of the intersection type
     */
    constructor(public types: LCEType[]) {
        super(LCETypeIntersection.typeId);
    }
}

/**
 * Represents an object type (e.g. `{x: string, y: number}`)
 */
export class LCETypeObject extends LCEType {
    public static override conceptId = "object-type";
    public static readonly typeId = "object";

    /**
     * @param members members of the object type
     */
    constructor(public members: LCETypeObjectMember[]) {
        super(LCETypeObject.typeId);
    }
}

/**
 * Represents a member of an object type (e.g. the `x: string` in `{x: string, y: number}`)
 */
export class LCETypeObjectMember extends LCEConcept {
    public static override conceptId = "object-type-member";

    /**
     * @param name name of the object member
     * @param type type of the member
     * @param optional indicates whether the member is optional
     * @param readonly indicates whether the member is read-only
     */
    constructor(public name: string,
                public type: LCEType,
                public optional: boolean,
                public readonly: boolean) {
        super();
    }
}

/**
 * Represents a function type (e.g. `(x: string) => number`)
 */
export class LCETypeFunction extends LCEType {
    public static override conceptId = "function-type";
    public static readonly typeId = "function";

    /**
     * @param returnType return type of the function
     * @param parameters map of parameter names and their respective types
     * @param typeParameters list of type parameters declared by the function type
     */
    constructor(public returnType: LCEType,
                public parameters: LCETypeFunctionParameter[],
                public async: boolean,
                public typeParameters: LCETypeParameterDeclaration[]) {
        super(LCETypeFunction.typeId);
    }
}

/**
 * Represents a parameter inside a function type (e.g. `x: string` in `(x: string) => number`)
 */
export class LCETypeFunctionParameter extends LCEConcept {
    public static override conceptId = "function-type-parameter";

    /**
     * @param index position of the parameter in the parameter list
     * @param name name of the parameter
     * @param optional indicates whether the parameter is optional
     * @param type type of the parameter
     */
    constructor(public index: number, public name: string, public optional: boolean, public type: LCEType) {
        super();
    }
}

/**
 * Represents a reference to a type was previously declared as type parameter.
 */
export class LCETypeParameterReference extends LCEType {
    public static override conceptId = "type-parameter";
    public static readonly typeId = "type-parameter";

    /**
     * @param name name of the type parameter
     */
    constructor(public name: string) {
        super(LCETypeParameterReference.typeId);
    }
}

/**
 * Represents a type literal (e.g. `"zero"` or `0` in `x: "zero" | 0`)
 */
export class LCETypeLiteral extends LCEType {
    public static override conceptId = "literal-type";
    public static readonly typeId = "literal";

    /**
     * @param value content of the type literal
     */
    constructor(public value: string | number | boolean) {
        super(LCETypeLiteral.typeId);
    }
}

/**
 * Represents a tuple type (e.g. `x: [string, number]`)
 */
export class LCETypeTuple extends LCEType {
    public static override conceptId = "tuple-type";
    public static readonly typeId = "tuple";

    /**
     * @param types types of the tuple
     */
    constructor(public types: LCEType[]) {
        super(LCETypeTuple.typeId);
    }
}

/**
 * Represents a type that could not be parsed correctly.
 */
export class LCETypeNotIdentified extends LCEType {
    public static override conceptId = "not-identified-type";
    public static readonly typeId = "not-identified";

    public static readonly COMPLEX_VALUE = new this("Complex Value");
    public static readonly CLASS_EXPRESSION = new this("Class Expression");
    public static readonly CONSTRUCTOR = new this("Constructor");
    public static readonly SETTER = new this("Setter");
    public static readonly INDEXED_ACCESS_TYPE = new this("Type containing a (potentially recursive) indexed access type");
    public static readonly DEEP_PARTIAL_OBJECT = new this("Type containing DeepPartialObject (not supported)");

    /**
     * @param identifier string representation of type that could not successfully be parsed
     */
    constructor(public identifier: string) {
        super(LCETypeNotIdentified.typeId);
    }
}
