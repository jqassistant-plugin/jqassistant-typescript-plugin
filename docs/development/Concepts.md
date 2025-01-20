---
aliases:
  - concept
---
# Concepts
-> classes representing [LCE language concepts](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Language-Concept)
- located in `typescript/src/core/concepts`
	- all files end with `.concept.ts`
	- may export one or more concept classes each

**Notes for creating new concept classes:**
- each concept class must (indirectly) inherit from `LCEConcept`/`LCENamedConcept`
- each concept class must override the static `conceptId` field with a unique string identifier
- use `CodeCoordinates` class as field type to encode code coordinates
- all type and value concepts are located in `type.concept.ts` and `value.concept.ts` respectively

**`ConceptMap`:**
- [Concept Maps](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Concept-Map) are realized in their more complex form, integrating parent property names into their index structure
- use `mergeConceptMaps`, `unifyConceptMap`, `singleEntryConceptMap`, `createConceptMap`, and `getAndCastConcepts` utility functions for the concise management of `ConceptMap` instances