/* eslint-disable */
export interface BaseInterface {
    x: number;
}

export interface BaseInterface2 {
    x: number;
    y: number;
}

export abstract class BaseClass {
    public name: string = "";
}

export function Decorator(constructor: Function) {
    console.log('Decorator called.');
}
