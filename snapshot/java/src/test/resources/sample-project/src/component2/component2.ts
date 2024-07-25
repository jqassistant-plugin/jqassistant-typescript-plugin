import { TestClass } from '../../../supplementary-sample-project/example-program1';
import { ImplementMe, myConst as myC } from '../component1/component1';
import { component, required } from '../framework';
import { Model2 } from './component2.model';

export { Component2 as C2 };
export * as fs from 'fs';

@component
class Component2 {
  _a: string = '';
  myProp: Model2 = new Model2();
  public myProp2: TestInterface = { x: 0, y: 1 };
  protected myProp3: TestType = 3;
  private myProp4: { x: string } = { x: '' };
  myPropFunc: <T extends { a: number }>(x: T[]) => T = (x) => x[0];
  myProp5: string[] | Array<number> | Map<number, string> | Function = [''];
  readonly myProp6: Date = new Date();
  myProp7: 'abc' | 42 = 'abc';
  myProp8: [string, number] = ['a', 1];
  #mySuperPrivateProp: number = 10;

  accessor someAutoAccessor = "xyz";

  constructor(
    protected readonly myProtectedReadonlyProp: number,
    private model?: Model2
  ) {}

  render(): void {
    console.log('Rendering Component2');
    this.model!.print('a');
    this.model!.print('b');
  }

  comp2Func(): void {}

  myFuncTest<T>(@required myParam1: number, myParam2: string[]): T[] {
    return [];
  }

  set a(value: number | string) {
    this._a = '' + value;
  }

  get a(): string {
    return this._a;
  }

  #myJSPrivateFunc(): void {}
}

export default class Component2Extended
  extends Component2
  implements ImplementMe
{
  newExtensionProp: TestInterfaceExtended = {
    x: 1,
    y: 2,
    z: 3,
    genericProp: 'generic',
  };
  implProp: number = 42;

  constructor(public override myProp: Model2) {
    super(0);
  }

  override comp2Func(): void {
    super.comp2Func();
    console.log('Extended func');
  }

  override set a(value: string) {
    this._a = 'impl:' + value;
  }

  otherFunc(x: number): number {
    return x + 1;
  }

  implMethod(a: number): void {
    console.log('doSth');
  }
}

class Class1<T> {}

abstract class Class2 extends Class1<string> {
  static readonly staticProp: number = 42;

  constructor(public x: number) {
    super();
  }

  abstract myAbstractMethod(x: number): number;

  abstract myAbstractProp: number;
}

function myGlobalFunc<T>(x: number, y: T[]): string[] {
  return [];
}

interface GenericInterface<T> {
  genericProp: T;
}

interface TestInterface {
  x: number;
  y: number;
}

interface TestInterfaceExtended
  extends TestInterface,
    GenericInterface<string> {
  z: number;
}

interface TestInterface2<T extends { a: number; b: string }> {
  interfaceProp1: T[];
  interFunc(x: number): string;
  set a(value: string);
  boolNum: true | false | number;
}

let externalTestInstance = new TestClass(5);
let aGeneric = myGlobalFunc<number | string>(4, [2, 3]);
let a0;
let a1_0 = 0,
  a1_1 = 'str',
  a1_2 = true,
  a1_3 = /.*/,
  a1_4 = 100n,
  a1_5 = null,
  a1_6 = undefined;
let aRef = a1_0;
let aRef2 = myC;
let a2 = {
  a: 'abc',
  b: 32 + 4,
  c: a1_0,
  d: true,
};
let aI: TestInterface = {
  x: 5,
  y: 6,
};
let aI_2 = aI.x;
let a4 = console.log(4);
let a4_2 = [1].concat([2]).concat([3]);
let a5: string | undefined = undefined;
let a6 = (1 + 2) * 3;
let a7 = true ? 4 : 5;
let a8 = typeof a7;
let a9 = !a8;
let a10 = class A {};
let a11 = new Date(),
  a12 = 12;
let a13 = [1, 2, 3, ...[4, 5, 6]];
let a14: {x: number, y:string} = {x: 1, y: "y"};

let aFunc = function <T extends { x: string }>(a: string, b?: T): string {
  let c = new Model2();
  return a + b!.x;
};

let aArrFunc = <T extends { a: string }>(x: number, y: T, z: Model2): number =>
  x + 1;

export class DepA {
  x: number = 5;
}

export class DepB {
  a: DepA = new DepA();
}

export class DepC {
  b: DepB = new DepB();
}

type TestType = TestInterface | number;

type TestType2<T> =
  | {
      x: number;
      y: TestType;
      readonly z: number;
      w: T[];

      a(x: number): number;
      b(x: DepC): DepB;
    }
  | string;

type TestType3<T> = TestType2<{ x: T }>;

type TestType4 = Map<string, string>;

type TestType5 = keyof TestInterface;

type TestType6 = {
  x: number;
  y: string;
  z: TestInterface;
};

type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
