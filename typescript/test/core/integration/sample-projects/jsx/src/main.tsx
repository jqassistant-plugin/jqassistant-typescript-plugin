/* eslint-disable */

import React from "react";
import { REMOTE } from "./secondary";

const LOCAL = "local"


function returnJSX() {
    return <div></div>;
}

function localRef() {
    return <div>
        {LOCAL}
    </div>
}

function remoteRef() {
    return <div>
        {REMOTE}
    </div>
}

