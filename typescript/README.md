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

This will save the JSON report under `./build/jqa-ts-output.json` in the project directory.
