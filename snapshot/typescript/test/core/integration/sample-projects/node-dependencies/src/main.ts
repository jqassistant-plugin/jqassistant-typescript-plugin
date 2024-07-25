/* eslint-disable */

import { ExternalCustomClass } from "./secondary";
import { think } from "cowsay";

class CustomClass {
    public saySthExternal() {
        const x = new ExternalCustomClass();
        x.saySth();
    }
}

class OtherClass {
    public thinkSth() {
        think({
            text: "moo"
        });

    }
}
