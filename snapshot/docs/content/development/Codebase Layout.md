---
aliases:
  - codebase layout
---
# Codebase Layout
The codebase of the plugin is structured the following way:
- `docs/`: contains the documentation you're reading right now
- `java/`: contains the Java-based [jQA-Plugin](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/jQAssistant-Plugin)
	- `src/main/`: implementation of the [jQA-Plugin](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/jQAssistant-Plugin)
		- `o.j.p.t.api`: `TypeScriptScope` and all `Descriptor` interfaces
		- `o.j.p.t.impl`
			- `filesystem`: custom Implementation of the file resolver
			- `mapper`: MapStruct-based mappers and resolvers for POJO-to-Descriptor Mappings (*contains main logic of the plugin*)
			- `model`: POJOs that model the JSON output of the [LCE tool](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/LCE-Tool)
	- `src/test/`: integration tests for the [jQA-Plugin](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/jQAssistant-Plugin)
- `typescript/`: contains the implementation and tests for the TypeScript [LCE tool](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/LCE-Tool)
	- `src/`: implementation of the [LCE tool](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/LCE-Tool)
		- `core/`: code for the [LCE framework](https://jqassistant-plugin.github.io/jqassistant-lce-docs/) and all core language features
			- `concepts/`: [[Concepts|concept]] implementations
			- `post-processors/`: [[Post-Processors|post-processor]] implementations
			- `processors/`: [[Processors|processor]] implementations
			- `traversers/`: [[Traversers|traverser]] implementations
			- `utils/`: various [[Utilities|utility]] functions, etc.
			- *the `.ts` files directly contained in this directory model the [LCE framework](https://jqassistant-plugin.github.io/jqassistant-lce-docs/)*
		- `react/`: code for the [[React Extension]]
		- ... *directories for future extensions*
		- `main.ts`: contains entry point of the tool that parses the CLI arguments and initializes the extensions
	- `test/`: tests for the [LCE tool](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/LCE-Tool)