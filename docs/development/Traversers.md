---
aliases:
  - traverser
---
# Traversers
-> [LCE traversers](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Traversers) are implemented as a modified visitor pattern
- The abstract `Traverser` base class provides the implementation that orchestrates the execution of the other components
	- only the `traverseChildren` method that delegates the traversal of potential child nodes to other traversers is abstract and has to be implemented by sub types
- for each AST node type (provided via `@typescript-eslint/utils`) that should be processed, a separate `Traverser` implementation has to be provided
	- note that skipping nodes in the ESLint AST through a simplified `Traverser` implementation (e.g. via nested node access: `runTraverserForNodes(node.body.body, ...)`) must be avoided as it leads to an incorrectly set `parent` property on the traversed child nodes
- all traverser implementations are located under `typescript/src/core/traversers`
	- all files end with `.traverser.ts`
	- may export one or more traverser classes each

**Notes for creating new traversers:**
- each traverser class must inherit from `Traverser`
- all traversers need to be registered in the `TRAVERSERS` [feature collection](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Feature-Collections) in `features.ts`
	- before implementing a new traverser check if there already exists one in the collection
	- existing traversers may not trigger the traversal for all their child nodes: expand where needed
	- for nodes that don't have any children that should be traversed the `SimpleTraverser` default implementation can be specified in `TRAVERSERS` for the corresponding node type
- use `runTraverserForNode`(`s`) utility function to easily delegate the traversal process
- parent property names should be declared as `public static readonly` members of the implementing class
