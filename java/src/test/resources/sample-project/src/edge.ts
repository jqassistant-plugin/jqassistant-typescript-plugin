interface I1 {
  a: number;
  b: string;
}

interface I2 {
  c: number;
  d: I1;
}

class EdgeCase {
  destruct1({ a, b }: I1): void {}

  destruct2({ a: a1, b: b1 }: I1, x: I1, { c, d: { a, b } }: I2): void {}
}

function destructF1({ a, b }: I1): void {}

function destructF2(
  { a: a1, b: b1 }: I1,
  x: number,
  { c, d: { a, b } }: I2
): void {}

const destructA1 = ({ a, b }: I1): void => {};

const destructA2 = (
  { a: a1, b: b1 }: I1,
  x: number,
  { c, d: { a, b } }: I2
): void => {};
