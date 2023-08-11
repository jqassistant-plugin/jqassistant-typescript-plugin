

export class ExternalCustomClass {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export interface ExternalCustomInterface {
    x: number;
    y: number;
}

export type ExternalCustomType = {
    x: number;
    y: number;
};

export enum ExternalCustomEnum {
    A = 1,
    B = 2,
}
