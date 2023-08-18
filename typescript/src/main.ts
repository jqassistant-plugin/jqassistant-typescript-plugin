#! /usr/bin/env node

import { processAndOutputResult } from "./core/extractor";

// TODO: plan how to handle extensions
// initializeReactExtractor();
if(process.argv[2]) {
    processAndOutputResult(process.argv[2]);
} else {
    processAndOutputResult(".");
}
