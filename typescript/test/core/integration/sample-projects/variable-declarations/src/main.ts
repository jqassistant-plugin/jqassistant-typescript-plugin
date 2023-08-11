/* eslint-disable */

// Sample Declarations to be used later
import {ExternalCustomClass, ExternalCustomEnum, ExternalCustomInterface, ExternalCustomType} from "./secondary";

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
let vRefDirect = vString;
let vRefMember = vObject.a;
let vRefCall = vFunction(3);
let vInterfaceObj: CustomInterface = { x: 1, y: 2 };
let vClassObj = new CustomClass(1, 2);
let vTypeObj: CustomType = { x: 1, y: 2 };
let vEnum = CustomEnum.A;

let vExtInterfaceObj: ExternalCustomInterface = { x: 1, y: 2 };
let vExtClassObj = new ExternalCustomClass(1, 2);
let vExtTypeObj: ExternalCustomType = { x: 1, y: 2 };
let vExtEnum = ExternalCustomEnum.A;
