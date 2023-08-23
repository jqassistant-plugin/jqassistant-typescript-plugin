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

class CustomClassTypeParams<T, U> {
    constructor(public x: T, public y: U) {
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

// Enum declarations
enum eEmpty {}

enum eBasic {
    A,
    B,
    C
}

export enum eExported {
    A,
    B,
    C
}

enum eNumeric {
    A = 5,
    B,
    C = 10
}

enum eString {
    A = "a",
    B = "b"
}

enum eMixed {
    A = 1,
    B = "b"
}

enum eConstants {
    A = 1 + 1,
    B = "a" + "b",
    C = A + 1
}

enum eComputed {
    A = "abc".length
}

const enum eConst {
    A = 1,
    B
}

declare enum eAmbient {
    A,
    B
}
