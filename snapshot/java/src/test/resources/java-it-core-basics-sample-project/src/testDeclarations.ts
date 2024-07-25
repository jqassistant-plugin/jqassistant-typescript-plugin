/* eslint-disable */
import { BaseClass, BaseInterface, Decorator } from "./utils";

const CONSTANT = 42;

function func<T, U extends BaseInterface>(p1: T, p2: string): void {}

@Decorator
class Class extends BaseClass implements BaseInterface {
  x: number;

  get y(): number {
      return 0;
  }

  set y(newY: number) {
  }

  accessor w: number = 0;

  constructor(x: number, y: number, protected z: number) {
    super();
    this.x = x;
    this.y = y;
  }

  private method<T extends {a: number, b: string}>(p1: boolean, p2: string): void {}
}

interface Interface extends BaseInterface{
    prop: string;
    get getter(): number;
    set setter(value: number | string);
    method(p1: number): boolean;
}

enum Enum {
    ELEM1,
    ELEM2
}
