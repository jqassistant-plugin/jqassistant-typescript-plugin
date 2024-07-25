---
aliases:
  - post-processor
---
# Post-Processors
-> classes representing [LCE post-processors](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Post-Processors)
- located in `typescript/src/core/post-processors`
	- all files end with `.post-processor.ts`
	- may export one or more concept classes each

**Notes for creating new post-processor classes:**
- each post-processor class must inherit from `PostProcessor` and implement the `postProcess` method
- all post-processors need to be registered in the `POST_PROCESSORS` [feature collection](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Feature-Collections) in `features.ts`
	- before implementing a new post-processor check if there already exists one that could be modified to also solve the problem at hand
