#! /usr/bin/env node

import { program } from "commander";
import { processAndOutputResult } from "./core/extractor";
import packageInfo from "../package.json";
import { initializeReactExtractor } from "./react/react-extractor";


// Setup CLI
program
    .name("jqa-ts-lce")
    .description("jQAssistant TypeScript Language Concept Extractor\n" +
        "Tool to extract language concepts from a TypeScript codebase and export them to a JSON file.")
    .version(packageInfo.version)
    .argument("[path]", "path to the root of the TypeScript project to be scanned", ".")
    .option("-e, --extension [extensions...]", "space separated list of extensions to activate")
    .option("-p, --pretty", "pretty-print JSON result report");
program.parse();

// retrieve CLI arguments and options
const options = program.opts();

const extensions: string[] = options.extension ?? [];
const prettyPrint = !!options.pretty;

const projectRootPath: string = program.processedArgs[0];

// initialize extensions
if(extensions.includes("react")) {
    initializeReactExtractor();
}

// initializeReactExtractor();
processAndOutputResult(projectRootPath, {prettyPrint});
