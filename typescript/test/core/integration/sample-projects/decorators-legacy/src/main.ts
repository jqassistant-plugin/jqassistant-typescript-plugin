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

// Decorator definitions
const dClassMarker: ClassDecorator = (constr) => {
    return constr;
}

function dClassArgs(arg1: number, arg2: string): ClassDecorator {
    return (constr) => {
        return constr;
    }
}

function dClassObjectArg(arg: {mem1: number, mem2: string}): ClassDecorator {
    return (constr) => {
        return constr;
    }
}

// Class declarations with applied decorators
@dClassMarker
class cMarker {}

@dClassArgs(5, "abc")
class cClassArg {}

@dClassObjectArg({mem1: 1, mem2: "xyz"})
class cClassObjectArg {}

@dClassMarker
@dClassArgs(1, "a")
class cClassMulti {}
