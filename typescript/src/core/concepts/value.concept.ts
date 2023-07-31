import {LCEConcept} from "../concept";
import {LCEType, LCETypeDeclared, LCETypeNotIdentified, LCETypePrimitive} from "./type.concept";

/** Base class for all values. */
export abstract class LCEValue extends LCEConcept {
    public static override conceptId = "value";

    /**
     * @param type type of the value
     */
    constructor(public type: LCEType) {
        super();
    }
}

/**
 * Represents a null value (`undefined` or `null`)
 */
export class LCEValueNull extends LCEValue {
    public static override conceptId = "null-value";

    /**
     * @param kind indicates whether value is `undefined` or `null`
     */
    constructor(public kind: "undefined" | "null") {
        super(new LCETypePrimitive(kind));
    }
}

/**
 * Represents a literal value (e.g. `42`, `true` or `"str"`)
 */
export class LCEValueLiteral extends LCEValue {
    public static override conceptId = "literal-value";

    /**
     * @param value the value of the literal
     */
    constructor(public value: string | number | bigint | boolean | RegExp) {
        super(typeof value === "object" ? new LCETypeDeclared("RegExp", []) : new LCETypePrimitive(typeof value));
    }
}

/**
 * Represents a declared variable/function/class used as a value (e.g. `myVariable` or `myFunction`)
 */
export class LCEValueDeclared extends LCEValue {
    public static override conceptId = "declared-value";

    /**
     * @param fqn fully qualified name of the referenced variable/function/class
     */
    constructor(type: LCEType, public fqn: string) {
        super(type);
    }
}

/**
 * Represents a member expression (e.g. `myObj.x`)
 */
export class LCEValueMember extends LCEValue {
    public static override conceptId = "member-value";

    /**
     * @param parent parent value of which a member is accessed
     * @param member member value which is accessed
     */
    constructor(type: LCEType, public parent: LCEValue, public member: LCEValue) {
        super(type);
    }
}

/**
 * Represents a object expression (e.g. `{a: 3, b: "str"}`)
 */
export class LCEValueObject extends LCEValue {
    public static override conceptId = "object-value";

    /**
     * @param members map of the object member's names to their respective values
     */
    constructor(type: LCEType, public members: Map<string, LCEValue>) {
        super(type);
    }
}

/**
 * Represents a single property of an object expression (e.g. `a: 3` in `{a: 3, b: "str"}`)
 * Only used as an intermediate concept within the traversal process
 */
export class LCEValueObjectProperty extends LCEValue {
    public static override conceptId = "object-value-property";

    /**
     * @param name name of the property
     * @param value value of the property
     */
    constructor(public name: string, public value: LCEValue) {
        super(value.type);
    }
}

/**
 * Represents a array expression (e.g. `[1, 2, 3]`)
 */
export class LCEValueArray extends LCEValue {
    public static override conceptId = "array-value";

    /**
     * @param items item values of the array
     */
    constructor(type: LCEType, public items: LCEValue[]) {
        super(type);
    }
}

/**
 * Represents a call expression (e.g. `myArr.concat([4, 5])`)
 */
export class LCEValueCall extends LCEValue {
    public static override conceptId = "call-value";

    /**
     * @param type return type of the call
     * @param callee value that is called (e.g. `myArr.concat`)
     * @param args values of the arguments
     * @param typeArgs type arguments specified for call
     */
    constructor(type: LCEType, public callee: LCEValue, public args: LCEValue[], public typeArgs: LCEType[]) {
        super(type);
    }
}

/**
 * Represents a function expression (e.g. `function(x: string) { return x.trim(); }`)
 */
export class LCEValueFunction extends LCEValue {
    public static override conceptId = "function-value";

    /**
     * @param type return type of the function
     * @param arrowFunction indicates whether the function is an arrow function
     */
    constructor(type: LCEType, public arrowFunction: boolean) {
        super(type);
    }
}

/**
 * Represents a class expression (e.g. `class A {}`)
 */
export class LCEValueClass extends LCEValue {
    public static override conceptId = "class-value";

    constructor() {
        super(new LCETypeNotIdentified("class expression"));
    }
}

/**
 * Represents an expression that could not be resolved with other value types
 */
export class LCEValueComplex extends LCEValue {
    public static override conceptId = "complex-value";

    /**
     * @param expression string representation of the value's expression
     */
    constructor(public expression: string) {
        super(new LCETypeNotIdentified("complex"));
    }
}

export const valueConceptIds = [
    LCEValue.conceptId,
    LCEValueNull.conceptId,
    LCEValueLiteral.conceptId,
    LCEValueDeclared.conceptId,
    LCEValueMember.conceptId,
    LCEValueObject.conceptId,
    LCEValueObjectProperty.conceptId,
    LCEValueArray.conceptId,
    LCEValueCall.conceptId,
    LCEValueFunction.conceptId,
    LCEValueClass.conceptId,
    LCEValueComplex.conceptId,
];
