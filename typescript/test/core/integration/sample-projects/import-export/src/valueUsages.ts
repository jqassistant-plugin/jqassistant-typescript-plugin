import DefaultIdentifierClass, {
    DefaultInterface,
    DefaultSpecifierClass,
    DefaultValueClass,
    defaultValueFunction,
    ValueClass,
    valueConstant,
    valueFunction,
    valuesNamespace,
} from "./values";
import { aliasedValueFunction, DoubleRenamedValueClass } from "./valuesBarrel";
import { say } from "./reexport-node";

export function callFunction(): number {
    return valueFunction();
}

export function callAliasedFunction(): number {
    return aliasedValueFunction();
}

export function callNamespaceFunction(): number {
    return valuesNamespace.valueFunction();
}

export function callDefaultFunction(): number {
    return defaultValueFunction();
}

export function callNodeFunction(): string {
    return say({ text: "moo" });
}

export function readConstant(): number {
    return valueConstant;
}

export const valueInstance = new ValueClass();
export const aliasedInstance = new DoubleRenamedValueClass();
export const defaultInstance = new DefaultValueClass();
export const defaultIdentifierInstance = new DefaultIdentifierClass();
export const defaultSpecifierInstance = new DefaultSpecifierClass();
export let defaultInterfaceValue: DefaultInterface;
