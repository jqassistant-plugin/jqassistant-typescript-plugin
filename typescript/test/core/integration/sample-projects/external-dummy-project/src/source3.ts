class DummyCustomClass3 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface DummyCustomInterface3 {
    x: number;
    y: number;
}


type DummyCustomType3 = {
    x: number;
    y: number;
};

enum DummyCustomEnum3 {
    A = 1,
    B = 3,
}

export {DummyCustomClass3 as DummyCustomClass3Alias, DummyCustomInterface3, DummyCustomType3, DummyCustomEnum3};

export default class DummyDefaultClass3 {}
