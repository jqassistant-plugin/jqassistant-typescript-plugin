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
function fGenericMulti<T, U>(p1: T, p2: U): U {
    return p2;
}
function fGenericConstraint<T extends { x: number }>(p1: T) {}
function fGenericConstraintRef<T extends CustomInterface>(p1: T) {}

function fNested() {
    function nested() {}
}
