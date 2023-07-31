/* eslint-disable */

// Sample Declarations to be used later
class CustomClass {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface CustomInterface {
    x: number;
    y: number;
}

type CustomType = {
    x: number;
    y: number;
};

enum CustomEnum {
    A = 1,
    B = 2,
}

// Variable declarations
var vVarUninitialized;
let vLetUninitialized;
var vVarInit = 0;
let vLetInit = 0;
const vConstInit = 0;
let vMulti1 = 1,
    vMulti2 = 2;
export let vExported = 5;
let vUndefined = undefined;
let vNull = null;
let vTrue = true;
let vFalse = false;
let vNumber = 1;
let vString = "1";
let vObject = { a: 1, b: "2" };
let vArray = [1, 2, 3];
let vTuple: [number, string] = [1, "2"];
let vFunction = function (p1: number) {
    return "" + p1;
};
let vArrowFunction = (p1: number) => {
    return "" + p1;
};
let vClass = class {};
let vUnion: number | string = 1;
let vIntersection: { a: number } & { b: string } = { a: 1, b: "a" };
let vComplex = 1 + 2;
let vRefDirect = vNumber;
let vRefMember = vObject.a;
let vRefCall = vFunction(3);
let vInterfaceObj: CustomInterface = { x: 1, y: 2 };
let vClassObj = new CustomClass(1, 2);
let vTypeObj: CustomType = { x: 1, y: 2 };
let vEnum = CustomEnum.A;

// Function declarations
function fEmpty() {}

function fReturn(): number {
    return 1;
}
function fReturnRef(): CustomInterface {
    return { x: 1, y: 2 };
}

export function fExported() {}

function fBodyRef() {
    fEmpty();
    const x = new CustomClass(1, 2);
}

function fParam(p1: number) {}
function fMultiParam(p1: number, p2: string, p3?: string) {}
// function fParamDefault(p1: string = "") {} // TODO: enable this once default parameters are supported
// function fSpread(...p1: number[]) {} // TODO: enable this once spread parameters are supported
function fParamRef(p1: CustomClass) {}

function fGeneric<T>(p1: T) {}
function fGenericMulti<T, U>(p1: T, p2: U) {}
function fGenericConstraint<T extends { x: number }>(p1: T) {}
function fGenericConstraintRef<T extends CustomInterface>(p1: T) {}

function fNested() {
    function nested() {}
}

// Class declarations
class cEmpty {}
export class cExported {}

class cProperties {
    private x = 1;
    protected y = 2;
    public z = 3;
    #w = 4;

    readonly a = 5;
    b?: number;
}

class cConstructor {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        y = y + 1;
    }
}

class cMethods {
    private x() {}
    protected y() {}
    public z() {}
    #w() {}

    a(p1: number, p2: string): string {
        return p2 + p1;
    }
}

class cGetterSetter {
    set x(x: number) {
        this.x = x;
    }

    get x(): number {
        return this.x;
    }

    private set y(y: number) {
        this.y = y;
    }

    private get y(): number {
        return this.y;
    }
}

class cParameterProperties {
    constructor(public x: number, public y: number) {}
}

class cStatic {
    static staticA = 0;

    static staticSum(x: number, y: number): number {
        return x + y;
    }
}

abstract class cAbstract {
    abstract abstractA: number;
    abstract abstractSum(x: number, y: number): number;

    nonAbstractA = 0;
    nonAbstractSum(x: number, y: number): number {
        return x + y;
    }
}

class cExtends extends CustomClass {
    override x: number = 42;
}
class cImplements implements CustomInterface {
    x: number = 1;
    y: number = 2;
}

// TODO: Decorator samples

class cRef {
    public x: CustomInterface = { x: 1, y: 2 };

    public method(): CustomClass {
        return new CustomClass(1, 2);
    }
}

class cGeneric<T> {
    public method(p1: T): T {
        return p1;
    }
    public methodNested<U>(p1: T, p2: U): U {
        return p2;
    }
}

// Interface declarations
// TODO

// Type Alias declarations
// TODO

// Enum declarations
// TODO
