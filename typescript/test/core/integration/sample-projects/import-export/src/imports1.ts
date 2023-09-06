import * as x from "./reexport";
import { DummyCustomClass3Alias, DummyCustomInterface3 } from "./reexport";
import { DummyCustomClass } from "../../external-dummy-project/src/source1";
import { DummyCustomType2Alias as DummyCustomType2AliasAlias } from "../../external-dummy-project/src/source2";
import DefaultClass3 from "./source3";
import DummyDefaultClass3 from "../../external-dummy-project/src/source3";

let v1: x.someNamespace.CustomInterface3;
let v2: x.CustomClass2;
let v3: x.someNamespace.CustomClass3Alias;
let v4: x.CustomType2AliasAlias;
let v5: x.DummyCustomInterface;

let v6: DummyCustomClass;
let v7: DummyCustomType2AliasAlias;
let v8: DummyCustomClass3Alias;
let v9: DummyCustomInterface3;

let d1: x.DefaultAlias2;
let d2: DefaultClass3;
let d3: x.someNamespace.default;
let d4: DummyDefaultClass3;
