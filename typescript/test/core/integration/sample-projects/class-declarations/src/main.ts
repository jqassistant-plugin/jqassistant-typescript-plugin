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

// Class declarations
class cEmpty {}

class cProperties {
    private x = 1;
    protected y = 2;
    public z = 3;
    #w = 4;

    readonly a = 5;
    b?: number;
}

class cConstructor {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        y = y + 1;
    }
}

class cMethods {
    private x() {}
    protected y() {}
    public z() {}
    #w() {}

    a(p1: number, p2: string): string {
        return p2 + p1;
    }

    async mAsync(p1: number): Promise<number> {
        return p1;
    }
}

class cGetterSetter {
    set x(x: number) {
        this.x = x;
    }

    get x(): number {
        return this.x;
    }

    private set y(y: number) {
        this.y = y;
    }
}

class cAutoAccessor {
    accessor a: number = 4;
}

class cParameterProperties {
    constructor(public x: number, other: string, public y: number) {}
}

class cStatic {
    static staticA = 0;

    static staticSum(x: number, y: number): number {
        return x + y;
    }
}

export class cExported {
    static STATIC = 5;

    private _x: number;

    public pub: string = "abc";

    constructor() {
        this._x = 1;
    }

    public method(p1: number): string {
        return p1 + "x";
    }

}

abstract class cAbstract {
    abstract abstractA: number;
    abstract abstractSum(x: number, y: number): number;
    abstract accessor abstractAcc: string;

    nonAbstractA = 0;
    nonAbstractSum(x: number, y: number): number {
        return x + y;
    }
}

class cExtends extends CustomClass {
    override x: number = 42;
}
class cImplements implements CustomInterface {
    x: number = 1;
    y: number = 2;
}

class cImplementsMulti implements CustomInterface, CustomInterface2 {
    x: number = 1;
    y: number = 2;
    str: string = "a";
}

class cRef {
    public x: CustomInterface = { x: 1, y: 2 };

    public method(): CustomClass {
        return new CustomClass(1, 2);
    }
}

class cExtendsExt extends ExternalCustomClass {
    override x: number = 42;
}
class cImplementsExt implements ExternalCustomInterface {
    x: number = 1;
    y: number = 2;
}

class cRefExt {
    public x: ExternalCustomInterface = { x: 1, y: 2 };

    public method(): ExternalCustomClass {
        return new ExternalCustomClass(1, 2);
    }
}

class cGeneric<T> {
    public method(p1: T): T {
        return p1;
    }
    public methodNested<U>(p1: T, p2: U): U {
        return p2;
    }
}
