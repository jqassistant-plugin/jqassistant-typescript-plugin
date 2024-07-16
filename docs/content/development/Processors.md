---
aliases:
  - processor
---
# Processors
-> classes representing [LCE Processors](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Processors)
- located in `typescript/src/core/processors`
	- all files end with `.processor.ts`
	- may export one or more processor classes each

**Notes for creating new processors:**
- each processor class must inherit from `Processor`
	- only the `executionCondition` has to be specified
	- `preChildrenProcessing` and `postChildrenProcessing` methods have empty default implementations and can be overridden as needed
- use `CodeCoordinateUtils` to retrieve code coordinates from an ESLint node
- use functions of `processor.utils.ts` for easier handling of the used data structures
- use utility functions from`type.utils.ts` to process type information