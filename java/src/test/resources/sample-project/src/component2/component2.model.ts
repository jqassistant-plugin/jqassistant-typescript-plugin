import { model } from '../framework';

@model
export class Model2 {
    public a: string = "abc";
    public b: string = "def";

    exchange(): void {
        let temp = this.a;
        this.a = this.b;
        this.b = temp;
    }

    print(attr: string) {
        if(attr === "a") {
            console.log(this.a);
        } else if(attr === "b") {
            console.log(this.b);
        } else {
            console.log("attribute unknown");
        }
    }
}