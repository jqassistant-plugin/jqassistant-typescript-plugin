import { model } from '../framework';
import { TestClass } from '../../../sample-project-3/example-program1';
import { parse } from 'path';

class SomeInternalClass {}

class MyReferenceTestClass {
    propTestExt: TestClass = new TestClass(5);
    propTestNode = parse("./test.txt");
    propTestInternal = new SomeInternalClass();
}

@model
export class Model1 {
    public x: number = 0;
    public y: number = 0;

    exchange(): void {
        let temp = this.x;
        this.x = this.y;
        this.y = temp;
    }

    print(attr: string) {
        if(attr === "x") {
            console.log(this.x);
        } else if(attr === "y") {
            console.log(this.y);
        } else {
            console.log("attribute unknown");
        }
    }
}

class InternalClass {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    clearName(): void {
        this.name = "";
    }
}
