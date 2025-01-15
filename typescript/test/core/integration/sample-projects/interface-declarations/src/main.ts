/* eslint-disable */

// Sample Declarations to be used later
import { ExternalCustomClass, ExternalCustomInterface } from "./secondary";

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

interface CustomInterface2 {
    str: string;
}

type CustomType = {
    x: number;
    y: number;
};

enum CustomEnum {
    A = 1,
    B = 2,
}

// Interface declarations
interface iEmpty {}
export interface iExported {}

interface iProperties {
    x: number;
    readonly a: number;
    b?: number;
}
interface iMethods {
    x(): void;
    a(p1: number, p2: string): string;
}

interface iGetterSetter {
    set x(x: number);
    get x(): number;
    set y(y: number);
}

interface iExtends extends CustomInterface {
    newProp: string;
}

interface iExtendsMulti extends CustomInterface, CustomInterface2 {
    newProp: string;
}

interface iRef {
    x: CustomInterface;
    method(): CustomClass;
}

interface iExtendsExt extends ExternalCustomInterface {
}

interface iRefExt {
    x: ExternalCustomInterface;
    method(): ExternalCustomClass;
}

interface iGeneric<T> {
    method(p1: T): T;
    methodNested<U>(p1: T, p2: U): U;
}

interface iRecursive {
    a: string;
    r?: iRecursive;
}

interface iRecursiveIndexAccess {
    a: {
        a1: string;
        a2: {
            a21: string;
            a22: number;
        };
        ab?: iRecursiveIndexAccess["b"];
    };
    b: {
        b1: string;
        ba: iRecursiveIndexAccess["a"][];
        bci: iRecursiveIndexAccess["c"]["ci"];
    };
    c: {
        ci: {
            ci1: boolean;
            ci2: number;
        };
    };
}
