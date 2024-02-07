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

    /**
     * @param name identifier of the primitive type
     */
    constructor(public name: string) {
        super("primitive");
    }
}

/**
 * Represents a type defined by a class, interface or type alias
 */
export class LCETypeDeclared extends LCEType {
    public static override conceptId = "declared-type";

    /**
     * @param fqn fully qualified name of a class/interface/type alias (only uses global FQN)
     * @param typeArguments list of type arguments provided for generics
     */
    constructor(public fqn: FQN, public typeArguments: LCEType[]) {
        super("declared");
    }
}

/**
 * Represents an union type (e.g. `string | number`)
 */
export class LCETypeUnion extends LCEType {
    public static override conceptId = "union-type";

    /**
     * @param types constituents of the union type
     */
    constructor(public types: LCEType[]) {
        super("union");
    }
}

/**
 * Represents an intersection type (e.g. `A & B`)
 */
export class LCETypeIntersection extends LCEType {
    public static override conceptId = "intersection-type";

    /**
     * @param types constituents of the intersection type
     */
    constructor(public types: LCEType[]) {
        super("intersection");
    }
}

/**
 * Represents an object type (e.g. `{x: string, y: number}`)
 */
export class LCETypeObject extends LCEType {
    public static override conceptId = "object-type";

    /**
     * @param members members of the object type
     */
    constructor(public members: LCETypeObjectMember[]) {
        super("object");
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

    /**
     * @param returnType return type of the function
     * @param parameters map of parameter names and their respective types
     * @param typeParameters list of type parameters declared by the function type
     */
    constructor(public returnType: LCEType,
                public parameters: LCETypeFunctionParameter[],
                public async: boolean,
                public typeParameters: LCETypeParameterDeclaration[]) {
        super("function");
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

    /**
     * @param name name of the type parameter
     */
    constructor(public name: string) {
        super("type-parameter");
    }
}

/**
 * Represents a type literal (e.g. `"zero"` or `0` in `x: "zero" | 0`)
 */
export class LCETypeLiteral extends LCEType {
    public static override conceptId = "literal-type";

    /**
     * @param value content of the type literal
     */
    constructor(public value: string | number | boolean) {
        super("literal");
    }
}

/**
 * Represents a tuple type (e.g. `x: [string, number]`)
 */
export class LCETypeTuple extends LCEType {
    public static override conceptId = "tuple-type";

    /**
     * @param types types of the tuple
     */
    constructor(public types: LCEType[]) {
        super("tuple");
    }
}

/**
 * Represents a type that could not be parsed correctly.
 */
export class LCETypeNotIdentified extends LCEType {
    public static override conceptId = "not-identified-type";

    /**
     * @param identifier string representation of type that could not successfully parsed
     */
    constructor(public identifier: string) {
        super("not-identified");
    }
}
