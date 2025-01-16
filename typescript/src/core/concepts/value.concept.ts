import { LCEConcept } from "../concept";
import { LCEType, LCETypeDeclared, LCETypeNotIdentified, LCETypePrimitive } from "./type.concept";
import { FQN } from "../context";

/** Base class for all values. */
export abstract class LCEValue extends LCEConcept {
    public static override conceptId = "value";

    /**
     * @param type type of the value
     */
    protected constructor(
        public valueType: string,
        public type: LCEType
    ) {
        super();
    }
}

/**
 * Represents a null value (`undefined` or `null`)
 */
export class LCEValueNull extends LCEValue {
    public static override conceptId = "null-value";
    public static readonly valueTypeId = "null";


    /**
     * @param kind indicates whether value is `undefined` or `null`
     */
    constructor(public kind: "undefined" | "null") {
        super(LCEValueNull.valueTypeId, new LCETypePrimitive(kind));
    }
}

/**
 * Represents a literal value (e.g. `42`, `true` or `"str"`)
 */
export class LCEValueLiteral extends LCEValue {
    public static override conceptId = "literal-value";
    public static readonly valueTypeId = "literal";

    /**
     * @param value the value of the literal
     */
    constructor(public value: string | number | bigint | boolean | RegExp) {
        super(
            LCEValueLiteral.valueTypeId,
            typeof value === "object" ? new LCETypeDeclared(new FQN("RegExp"), []) : new LCETypePrimitive(typeof value)
        );
    }
}

/**
 * Represents a declared variable/function/class used as a value (e.g. `myVariable` or `myFunction`)
 */
export class LCEValueDeclared extends LCEValue {
    public static override conceptId = "declared-value";
    public static readonly valueTypeId = "declared";

    /**
     * @param fqn fully qualified name of the referenced variable/function/class (only global Fqn is used)
     */
    constructor(type: LCEType, public fqn: FQN) {
        super(LCEValueDeclared.valueTypeId, type);
    }
}

/**
 * Represents a member expression (e.g. `myObj.x`)
 */
export class LCEValueMember extends LCEValue {
    public static override conceptId = "member-value";
    public static readonly valueTypeId = "member";

    /**
     * @param parent parent value of which a member is accessed
     * @param member member value which is accessed
     */
    constructor(type: LCEType, public parent: LCEValue, public member: LCEValue) {
        super(LCEValueMember.valueTypeId, type);
    }
}

/**
 * Represents a object expression (e.g. `{a: 3, b: "str"}`)
 */
export class LCEValueObject extends LCEValue {
    public static override conceptId = "object-value";
    public static readonly valueTypeId = "object";

    /**
     * @param members map of the object member's names to their respective values
     */
    constructor(type: LCEType, public members: Map<string, LCEValue>) {
        super(LCEValueObject.valueTypeId, type);
    }
}

/**
 * Represents a single property of an object expression (e.g. `a: 3` in `{a: 3, b: "str"}`)
 * Only used as an intermediate concept within the traversal process
 */
export class LCEValueObjectProperty extends LCEValue {
    public static override conceptId = "object-value-property";
    public static readonly valueTypeId = "object-property";

    /**
     * @param name name of the property
     * @param value value of the property
     */
    constructor(public name: string, public value: LCEValue) {
        super(LCEValueObjectProperty.valueTypeId, value.type);
    }
}

/**
 * Represents a array expression (e.g. `[1, 2, 3]`)
 */
export class LCEValueArray extends LCEValue {
    public static override conceptId = "array-value";
    public static readonly valueTypeId = "array";

    /**
     * @param items item values of the array
     */
    constructor(type: LCEType, public items: LCEValue[]) {
        super(LCEValueArray.valueTypeId, type);
    }
}

/**
 * Represents a call expression (e.g. `myArr.concat([4, 5])`)
 */
export class LCEValueCall extends LCEValue {
    public static override conceptId = "call-value";
    public static readonly valueTypeId = "call";

    /**
     * @param type return type of the call
     * @param callee value that is called (e.g. `myArr.concat`)
     * @param args values of the arguments
     * @param typeArgs type arguments specified for call
     */
    constructor(type: LCEType, public callee: LCEValue, public args: LCEValue[], public typeArgs: LCEType[]) {
        super(LCEValueCall.valueTypeId, type);
    }
}

/**
 * Represents a function expression (e.g. `function(x: string) { return x.trim(); }`)
 */
export class LCEValueFunction extends LCEValue {
    public static override conceptId = "function-value";
    public static readonly valueTypeId = "function";

    /**
     * @param type return type of the function
     * @param arrowFunction indicates whether the function is an arrow function
     */
    constructor(type: LCEType, public arrowFunction: boolean) {
        super(LCEValueFunction.valueTypeId, type);
    }
}

/**
 * Represents a class expression (e.g. `class A {}`)
 */
export class LCEValueClass extends LCEValue {
    public static override conceptId = "class-value";
    public static readonly valueTypeId = "class";

    constructor() {
        super(LCEValueClass.valueTypeId, new LCETypeNotIdentified("class expression"));
    }
}

/**
 * Represents an expression that could not be resolved with other value types
 */
export class LCEValueComplex extends LCEValue {
    public static override conceptId = "complex-value";
    public static readonly valueTypeId = "complex";

    /**
     * @param expression string representation of the value's expression
     */
    constructor(public expression: string) {
        super(LCEValueComplex.valueTypeId, new LCETypeNotIdentified("complex"));
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
