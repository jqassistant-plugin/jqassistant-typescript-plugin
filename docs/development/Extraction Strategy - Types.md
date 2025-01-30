# Extraction Strategy: Types
**Goal:** Enrichment of the graph structures with type information in the form of [[Node - TS Type|:TS:Type]] nodes

**Strategy:**
1. Use the ESLint Parser Services to get the native TS Compiler node for the AST node of a construct for which a type should be determined
2. Use TS Compiler TypeChecker to extract all information necessary to construct the type [[Concepts|concepts]]


**Central Components:**
- `LCEType` and all of it's sub-classes: concepts that represent various type constructs that TypeScript offers
- `type.utils.ts`: collection of functions that utilize the TS Compiler API to extract type [[Concepts|concepts]]
	- internally, the `parseType` and `parseAnonymousType` functions contain the central extraction logic
	- `parseESNodeType` and other exported `parseX` functions serve as shortcuts to extract type information for specific syntax constructs 