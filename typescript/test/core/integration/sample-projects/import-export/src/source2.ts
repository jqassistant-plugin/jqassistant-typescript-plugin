
class CustomClass2 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface CustomInterface2 {
    x: number;
    y: number;
}


type CustomType2 = {
    x: number;
    y: number;
};

enum CustomEnum2 {
    A = 1,
    B = 2,
}

export {CustomClass2, CustomInterface2, CustomType2 as CustomType2Alias, CustomEnum2};

export default class DefaultClass2 {}
