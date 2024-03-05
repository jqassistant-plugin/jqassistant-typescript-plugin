
export class IndexClass {
    public x: number = 1;
}

export interface IndexInterface {
    x: number;
}

export type IndexType = number | string;

export const IndexVar = 5;

export function IndexFunction() {
    return 5;
}

export enum IndexEnum {
    VALUE1
}

class AliasClass {
    public y: number = 2;
}
export {AliasClass as AliasAliasClass};
