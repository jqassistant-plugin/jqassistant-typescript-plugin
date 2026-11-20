import { EXPORT_CONSTANT } from "./testDep1";
import * as dep1Namespace from "./testDep1";

export * from "./testDep3";
export { EXPORT_CONSTANT, dep1Namespace };
