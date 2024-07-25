import { DepC } from '../component2/component2';
import { component } from '../framework';
import { Model1 } from './component1.model';

@component
export class Component1 {

    constructor(private model: Model1) {
    }

    render(): void {
        console.log("Rendering Component1");
        this.model.print("x");
        this.model.print("y");
    }
}

export const myConst = 1;

export interface ImplementMe {
    implProp: number;
    implMethod(a: number): void;
}

const c = new DepC();
const c1 = c.b.a;

enum Enum1 { // Union Enum
    A,
    B,
    C
}

enum Direction1 {
    Up = 1,
    Down,
    Left,
    Right,
}

let dir1 = Direction1.Down;

enum Direction2 {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

let dir2 = Direction2.Down;
  
enum FileAccess {
    // constant members
    None,
    Read = 1 << 1,
    Write = 1 << 2,
    ReadWrite = Read | Write,
    // computed member
    G = "123".length,
}

let enumVarA = Enum1.A;
let nameOfA = Enum1[enumVarA]; // "A"
  
const enum ConstEnum {
    A = 1,
    B = A * 2,
}
  
declare enum DeclareEnum {
    A = 1,
    B,
    C = 2,
}