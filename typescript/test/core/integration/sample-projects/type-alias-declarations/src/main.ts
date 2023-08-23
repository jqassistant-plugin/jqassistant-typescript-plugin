/* eslint-disable */

// Sample Declarations to be used later
import { ExternalCustomClass } from "./secondary";

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

// TypeAlias declarations
type tPrimitive = number;

export type tExported = number;

type tDeclaredClass = CustomClass;

type tDeclaredInterface = CustomInterface;

type tDeclaredTypeAlias = CustomType;

type tDeclaredEnum = CustomEnum;

type tDeclaredTypeArgs = Map<string, number>;

type tDeclaredExternal = ExternalCustomClass;

type tUnion = string | CustomInterface;

type tIntersection = {z: number} & CustomType;

type tObject = {
    x: number;
    y: CustomType;
    readonly z: number;
    w? : number;
    fun: (p1: string) => string;
    method(px: string): number;
};


export type tObjectExported = {
  x: CustomType;
};

type tFunction = (p1: number, p2?: string) => string;

type tLiteral = "literal";

type tTuple = [number, string];

type tTupleNamed = [i1: number, i2: boolean];

type tGeneric<K, V extends CustomType> = {
    key: K,
    value: V
}

type tLit1 = 'welcome_email' | 'email_heading';
type tLit2 = 'footer_title' | 'footer_sendoff';
type tTemplateLiteralType = `${tLit1 | tLit2}_id`;
