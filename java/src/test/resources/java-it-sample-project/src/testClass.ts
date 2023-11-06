import { MY_NUMBER } from "./testVariable";

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(point: Point): Point {
    return new Point(this.x + point.x, this.y + point.y);
  }

  reset() {
      this.x = MY_NUMBER;
      this.y = MY_NUMBER;
  }
}
