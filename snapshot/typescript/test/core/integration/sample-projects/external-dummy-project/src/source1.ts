export class DummyCustomClass {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export interface DummyCustomInterface {
    x: number;
    y: number;
}

export type DummyCustomType = {
    x: number;
    y: number;
};

export enum DummyCustomEnum {
    A = 1,
    B = 2,
}
