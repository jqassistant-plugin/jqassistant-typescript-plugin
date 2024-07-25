class DummyCustomClass2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface DummyCustomInterface2 {
    x: number;
    y: number;
}


type DummyCustomType2 = {
    x: number;
    y: number;
};

enum DummyCustomEnum2 {
    A = 1,
    B = 2,
}

export {DummyCustomClass2, DummyCustomInterface2, DummyCustomType2 as DummyCustomType2Alias, DummyCustomEnum2};
