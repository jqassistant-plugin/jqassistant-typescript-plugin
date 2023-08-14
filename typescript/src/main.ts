#! /usr/bin/env node

import { processAndOutputResult } from "./core/extractor";

// TODO: plan how to handle extensions
// initializeReactExtractor();
processAndOutputResult(process.argv[2]);
