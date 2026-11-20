/* eslint-disable */
import { EXPORT_CONSTANT } from "./testDep1";
import { reExportedFunction } from "./testDepBarrel";


const IMPORT_CONSTANT = EXPORT_CONSTANT;

export function callThroughBarrel(): number {
    return reExportedFunction();
}

export enum DependentEnum {
    A = EXPORT_CONSTANT,
    B = reExportedFunction(),
    C = DependentEnum.A + B,
}
