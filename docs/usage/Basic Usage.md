# Basic Usage
1. go through the [[Installation|installation and project setup]] process
2. if not done already, run `npm install` to completely download all dependencies
3. execute `jqa-ts-lce`(global installation) or `npm run jqa`(local installation) from the directory that contains your project(s) (this will generate a file `.reports/jqa/ts-output.json`)
    - use `--help` option to show available options for the command (when using local installation, options have to be specified in the `package.json`)
4. run the jQAssistant command line utility using `directory/to/jqa-cli/bin/jqassistant.sh scan` (imports `.reports/jqa/ts-output.json` into the graph database)

**Possible Use Cases:**
- analyze the graph and report violations via `directory/to/jqa-cli/bin/jqassistant.sh analyze` and `directory/to/jqa-cli/bin/jqassistant.sh report`
- start exploring the graph by starting the embedded server `directory/to/jqa-cli/bin/jqassistant.sh server` and opening your browser at [http://localhost:7474](http://localhost:7474)


**Project and Directory Structure:**
- the directory provided to the language concept extractor is scanned for TypeScript projects  
	- projects may be nested and/or [referenced](https://www.typescriptlang.org/docs/handbook/project-references.html)  
* all scanned files and directories are represented by `:File:Local` nodes that hold an absolute path (`absoluteFileName`) and optionally a path relative to the root of the containing [[Node - TS Project|:TS:Project]] (`fileName`)  
	- all directories also have the additional label `:Directory`  
	- all scanned files and directories share a common tree of nodes (the root of this tree represents the system root directory, i.e. `/` or `C:\`)  
	- NOTE: only the directory provided to the language concept extractor is fully traversed