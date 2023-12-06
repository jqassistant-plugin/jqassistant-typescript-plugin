let valueNull = null;

let valueLiteral = 5;

let valueDeclared = valueNull;

let valueObject = {
    a: 1,
    b: ""
}

let valueMember = valueObject.a;

let valueArray = [1, 2, 3];

let valueFunction = function<T>(p1: T, p2: number): string {
    return "";
}

let valueCall = valueFunction<string>("", 1);

let valueClass = class A {}

let valueComplex = valueLiteral + 5;
