/* eslint-disable */

export class CustomClass {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export interface CustomInterface {
    x: number;
    y: number;
}

export type CustomType = {
    x: number;
    y: number;
};

export enum CustomEnum {
    A = 1,
    B = 2,
}

class InternalCustomClass {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface InternalCustomInterface {
    x: number;
    y: number;
}

type InternalCustomType = {
    x: number;
    y: number;
};

enum InternalCustomEnum {
    A = 1,
    B = 2,
}
