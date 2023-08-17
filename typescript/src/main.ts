#! /usr/bin/env node

import { processAndOutputResult } from "./core/extractor";

// TODO: plan how to handle extensions
// initializeReactExtractor();
if(process.argv[2]) {
    processAndOutputResult(process.argv[2]);
} else {
    console.log('Please provide project path (e.g. "jqa-ts-lce /path/to/my/project")');
}
