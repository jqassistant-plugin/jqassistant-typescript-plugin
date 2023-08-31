
class CustomClass3 {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

interface CustomInterface3 {
    x: number;
    y: number;
}


type CustomType3 = {
    x: number;
    y: number;
};

enum CustomEnum3 {
    A = 1,
    B = 3,
}

export {CustomClass3 as CustomClass3Alias, CustomInterface3, CustomType3, CustomEnum3};
