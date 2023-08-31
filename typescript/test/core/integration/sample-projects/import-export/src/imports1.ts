import * as x from "./reexport";
import { DummyCustomClass3Alias, DummyCustomInterface3 } from "./reexport";
import { DummyCustomClass } from "../../external-dummy-project/src/source1";
import { DummyCustomType2Alias as DummyCustomType2AliasAlias } from "../../external-dummy-project/src/source2";

let v1: x.someNamespace.CustomInterface3;
let v2: x.CustomClass2;
let v3: x.someNamespace.CustomClass3Alias;
let v4: x.CustomType2AliasAlias;
let v5: x.DummyCustomInterface;

let v6: DummyCustomClass;
let v7: DummyCustomType2AliasAlias;
let v8: DummyCustomClass3Alias;
let v9: DummyCustomInterface3;
