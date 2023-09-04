# jQAssistant TypeScript Language Concept Extractor

Tool to extract language concepts from a TypeScript codebase and exports them to a JSON file.

This tool is meant to be used in conjunction with the [jQA TypeScript Plugin](https://github.com/jqassistant-plugin/jqassistant-typescript-plugin)

## Usage

After installing the tool via:
```bash
npm install -g "@jqassistant/ts-lce"
```
(NOTE: use Node.js version 18 or higher)

Run the command:
```bash
jqa-ts-lce <path-to-typescript-project>
```

This will save the JSON report under `.reports/jqa/ts-output.json` in the project directory.

# Compatibility

This plugin should be largely compatible with all versions of TypeScript.
However, it is only developed and tested against the current version (5.1) of TypeScript.

The tool only supports projects using ECMAScript modules. The old CommonJS sytax is not supported!

Currently, hierarchical tsconfig setups, as well as the scanning of multiple TypeScript projects at once is not supported.
