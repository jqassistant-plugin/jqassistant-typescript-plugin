export function valueFunction(): number {
    return 1;
}

export class ValueClass {}

export const valueConstant = 42;

class AliasedValueClass {}
export { AliasedValueClass as RenamedValueClass };

export default class DefaultValueClass {}
