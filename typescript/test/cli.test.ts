import { CommanderError } from "commander";
import { CliArguments, createCli, parseCliArguments } from "../src/cli";
import { DEFAULT_MAX_TYPE_RESOLUTION_DEPTH } from "../src/core/extractor";

describe("command line interface test", () => {
    function parse(...args: string[]): CliArguments {
        const cli = createCli()
            .exitOverride()
            .configureOutput({ writeOut: () => {}, writeErr: () => {} });
        return parseCliArguments(cli, args, { from: "user" });
    }

    function expectParseError(args: string[], code: string, message?: string) {
        let error: unknown;
        try {
            parse(...args);
        } catch (e) {
            error = e;
        }
        expect(error).toBeInstanceOf(CommanderError);
        expect((error as CommanderError).code).toBe(code);
        if (message) {
            expect((error as CommanderError).message).toContain(message);
        }
    }

    test("defaults", () => {
        expect(parse()).toEqual({
            projectRootPath: ".",
            extensions: [],
            prettyPrint: false,
            maxTypeResolutionDepth: DEFAULT_MAX_TYPE_RESOLUTION_DEPTH,
            debug: false,
        });
    });

    test("path and flags", () => {
        expect(parse("./project", "-p", "-d", "-e", "react")).toEqual({
            projectRootPath: "./project",
            extensions: ["react"],
            prettyPrint: true,
            maxTypeResolutionDepth: DEFAULT_MAX_TYPE_RESOLUTION_DEPTH,
            debug: true,
        });
    });

    test("type resolution depth before the path", () => {
        const cliArguments = parse("--type-resolution-depth", "5", "./project");
        expect(cliArguments.maxTypeResolutionDepth).toBe(5);
        expect(cliArguments.projectRootPath).toBe("./project");
    });

    test("type resolution depth after the path", () => {
        const cliArguments = parse("./project", "--type-resolution-depth", "0");
        expect(cliArguments.maxTypeResolutionDepth).toBe(0);
        expect(cliArguments.projectRootPath).toBe("./project");
    });

    test("type resolution depth with equals sign", () => {
        expect(parse("--type-resolution-depth=12").maxTypeResolutionDepth).toBe(12);
    });

    test.each(["abc", "-1", "1.5", "", "5abc"])("invalid type resolution depth '%s'", (value) => {
        expectParseError(["--type-resolution-depth", value], "commander.invalidArgument", "Expected a non-negative integer.");
    });

    test("type resolution depth without value", () => {
        expectParseError(["./project", "--type-resolution-depth"], "commander.optionMissingArgument");
    });
});
