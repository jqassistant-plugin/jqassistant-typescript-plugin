#! /usr/bin/env node

import pkg from '../package.json';
import { processProjectsAndOutputResult } from "./core/extractor";
import { createCli, parseCliArguments } from "./cli";
import { initializeReactExtractor } from "./react/react-extractor";
import { setDebugLogging } from "./core/utils/log.utils";


// retrieve CLI arguments and options
const cliArguments = parseCliArguments(createCli());
setDebugLogging(cliArguments.debug);

console.log(`Running jQAssistant TypeScript Language Concept Extractor ${pkg.version}`)

// initialize extensions
if(cliArguments.extensions.includes("react")) {
    initializeReactExtractor();
}

// initializeReactExtractor();
processProjectsAndOutputResult(cliArguments.projectRootPath, {
    prettyPrint: cliArguments.prettyPrint,
    maxTypeResolutionDepth: cliArguments.maxTypeResolutionDepth,
});
