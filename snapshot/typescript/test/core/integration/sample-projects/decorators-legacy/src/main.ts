/* eslint-disable */

// Sample Declarations to be used later

import { dClassArgsExternal } from "./secondary";

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

const dMethodMarker: MethodDecorator = (target, key, descriptor) => {
    return descriptor;
}

function dMethodArgs(arg1: number, arg2: string): MethodDecorator {
    return (target, key, descriptor) => {
        return descriptor;
    }
}

function dMethodObjectArg(arg: {mem1: number, mem2: string}): MethodDecorator {
    return (target, key, descriptor) => {
        return descriptor;
    }
}

const dPropertyMarker: PropertyDecorator = (target, key) => {}

function dPropertyArgs(arg1: number, arg2: string): PropertyDecorator {
    return (target, key) => {}
}

function dPropertyObjectArg(arg: {mem1: number, mem2: string}): PropertyDecorator {
    return (target, key) => {}
}

const dParameterMarker: ParameterDecorator = (target, key, index) => {}

function dParameterArgs(arg1: number, arg2: string): ParameterDecorator {
    return (target, key, index) => {}
}

function dParameterObjectArg(arg: {mem1: number, mem2: string}): ParameterDecorator {
    return (target, key, index) => {}
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

@dClassArgsExternal(3, "wow")
class cClassArgExt {}

class cMethodDecorators {
    @dMethodMarker
    method1() {}

    @dMethodArgs(42, "hello")
    method2() {}

    @dMethodObjectArg({ mem1: 100, mem2: "world" })
    method3() {}
}

class cPropertyDecorators {
    @dPropertyMarker
    property1: number = 1;

    @dPropertyArgs(5, "abc")
    property2: number = 2;

    @dPropertyObjectArg({ mem1: 1, mem2: "xyz" })
    property3: number = 3;
}

class cParameterDecorators {
    method(
        @dParameterMarker param1: number,
        @dParameterArgs(10, "param2") param2: string,
        @dParameterObjectArg({ mem1: 20, mem2: "param3" }) param3: any
    ) {}
}
