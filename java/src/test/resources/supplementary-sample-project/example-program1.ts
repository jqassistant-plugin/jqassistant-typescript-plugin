
export class TestClass {
    public num: number;

    constructor(i: number) {
        this.num = i;
    }

    returnNum() {
        return this.num;
    }
}

let testObject = new TestClass(5);
console.log(testObject.returnNum());
let x = 5;
let s: string = "ABC";