# Extraction Strategies
-> the extraction of language concepts is achieved by an implementation of the [LCE Architecture](https://jqassistant-plugin.github.io/jqassistant-lce-docs/)

**Information Sources:**
- the main source of information for extracting concepts from TS source code is the ESLint AST (provided through `@typescript-eslint/typescript-estree`)
	- use [ESLint Playground](https://typescript-eslint.io/play/) to easily explore the data structures
- additional information, mostly related to types, is extracted via the native TypeScript Compiler API (for more information see [here](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) and [here](https://github.com/microsoft/TypeScript-Compiler-Notes/blob/main/README.md)), especially the TypeChecker
	- direct translation between nodes of the two different ASTs can easily be done via the `services` global context
	- the Compiler API should be used sparingly, as it is less developer-friendly than the ESLint API

**General Guidelines:**
- all concepts have to be extracted within a single traversal of the ESLint AST
	- separate/additional sub-tree traversals are not allowed

**Currently Implemented Extraction Strategies:**
- [[Extraction Strategy - Dependencies|Dependencies and FQNs]]
- Types
- Values
- Imports
- Exports
- Classes and Interfaces
- Function Declarations
- Variable Declarations
- Type Aliases
- Enums
- Decorators
- Code Coordinates
- Special Case: Indexed Access Types