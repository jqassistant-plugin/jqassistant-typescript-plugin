---
aliases:
  - extension
---
# Extensions
-> besides the core language structures, [Extensions](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Extensions) can be used to implement optional, technology-specific scanning/processing components (i.e. [[Concepts|concepts]], [[Traversers|traversers]], [[Processors|processors]], or [[Post-Processors|post-processors]] and the concept representations in the jQA Plugin)

**LCE:**
- components for each extension is placed in a separate sub-directory in under `typescript/src` (e.g. `typescript/src/react`)
- each extension contains a main module called `extension-name-extractor.ts` that exports a function that adds all processing components of the extension to the [feature collections](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Feature-Collections) in `typescript/src/core/features.ts`
- `typescript/src/main.ts` must be extended to allow the extension to be activated and initialized
- all processing components are defined in the same manner and directory structure as their core counterparts

**jQA Plugin:**
- each of the technical packages contains sub-packages for the core and each individual extension
- the `ConceptCollection` class has to accommodate all possible concept types that can be emitted by the LCE tool