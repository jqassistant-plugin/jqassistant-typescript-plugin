import { Command, InvalidArgumentError, ParseOptions } from "commander";
import packageInfo from "../package.json";
import { DEFAULT_MAX_TYPE_RESOLUTION_DEPTH } from "./core/extractor";

/**
 * Settings for a run of the LCE tool, as specified on the command line
 */
export interface CliArguments {
    projectRootPath: string;
    extensions: string[];
    prettyPrint: boolean;
    maxTypeResolutionDepth: number;
    debug: boolean;
}

/**
 * @returns definition of the command line interface of the LCE tool
 */
export function createCli(): Command {
    return new Command()
        .name("jqa-ts-lce")
        .description(
            "jQAssistant TypeScript Language Concept Extractor\n" +
                "Tool to extract language concepts from a TypeScript codebase and export them to a JSON file.",
        )
        .version(packageInfo.version)
        .argument("[path]", "path to the root of the TypeScript project to be scanned", ".")
        .option("-e, --extension [extensions...]", "space separated list of extensions to activate (currently available: react)")
        .option("-p, --pretty", "pretty-print JSON result report")
        .option(
            "--type-resolution-depth <depth>",
            "maximum nesting depth up to which types are resolved, deeper nested types are replaced by a placeholder (0: only the outermost type)",
            parseTypeResolutionDepth,
            DEFAULT_MAX_TYPE_RESOLUTION_DEPTH,
        )
        .option("-d, --debug", "print debug information");
}

/**
 * Parses the command line arguments with the given command line interface.
 * Invalid arguments make the command print an error and exit the process, unless {@link Command.exitOverride} is set.
 * @param argv arguments to parse (default: `process.argv`)
 * @param parseOptions describes the format of `argv`, see {@link Command.parse}
 */
export function parseCliArguments(cli: Command, argv?: readonly string[], parseOptions?: ParseOptions): CliArguments {
    cli.parse(argv, parseOptions);
    const options = cli.opts();
    return {
        projectRootPath: cli.processedArgs[0],
        extensions: options.extension ?? [],
        prettyPrint: !!options.pretty,
        maxTypeResolutionDepth: options.typeResolutionDepth,
        debug: !!options.debug,
    };
}

function parseTypeResolutionDepth(value: string): number {
    if (!/^\d+$/.test(value)) {
        throw new InvalidArgumentError("Expected a non-negative integer.");
    }
    return Number(value);
}
