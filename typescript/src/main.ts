#! /usr/bin/env node

import { program } from "commander";
import { processProjectsAndOutputResult } from "./core/extractor";
import packageInfo from "../package.json";
import { initializeReactExtractor } from "./react/react-extractor";
import { setDebugLogging } from "./core/utils/log.utils";
import { setMaxTypeResolutionDepth } from "./core/processors/type.utils";


// Setup CLI
program
    .name("jqa-ts-lce")
    .description("jQAssistant TypeScript Language Concept Extractor\n" +
        "Tool to extract language concepts from a TypeScript codebase and export them to a JSON file.")
    .version(packageInfo.version)
    .argument("[path]", "path to the root of the TypeScript project to be scanned", ".")
    .option("-e, --extension [extensions...]", "space separated list of extensions to activate (currently available: react)")
    .option("-p, --pretty", "pretty-print JSON result report")
    .option("--type-resolution-depth", "depth at which nested types are no longer resolved", "10")
    .option("-d, --debug", "print debug information");
program.parse();

// retrieve CLI arguments and options
const options = program.opts();

const extensions: string[] = options.extension ?? [];
const prettyPrint = !!options.pretty;
setMaxTypeResolutionDepth(parseInt(options.typeResolutionDepth));
setDebugLogging(!!options.debug);

const projectRootPath: string = program.processedArgs[0];

// initialize extensions
if(extensions.includes("react")) {
    initializeReactExtractor();
}

// initializeReactExtractor();
processProjectsAndOutputResult(projectRootPath, {prettyPrint});
