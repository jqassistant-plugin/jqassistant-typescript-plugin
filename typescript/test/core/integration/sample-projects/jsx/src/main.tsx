/* eslint-disable */

// Sample Declarations to be used later

class CustomClass {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface CustomInterface {
    x: number;
    y: number;
}

interface CustomInterface2 {
    str: string;
}

type CustomType = {
    x: number;
    y: number;
};

enum CustomEnum {
    A = 1,
    B = 2,
}

function returnJSX() {
    return <div></div>;
}
