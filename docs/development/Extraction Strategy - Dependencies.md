# Extraction Strategy: Dependencies and FQNs
**Goal:** Creation of [[Node Relation - Dependencies|DEPENDS_ON]] relations between the various concept nodes

**Strategy:**
1. LCE: While traversing the AST register all referenced identifiers as dependencies (with source and target [[Node Properties - Fully Qualified Names|FQN]]) in a central data structure
2. LCE: After finishing the traversal aggregate all detected dependencies and store them as [[Concepts|concepts]]
	- Note: as [[Node Properties - Fully Qualified Names|FQNs]] can't always be resolved fully during the traversal, a resolution of them has to precede the dependency aggregation 
3. jQA Plugin: Create dependencies using the stored [[Node Properties - Fully Qualified Names|global FQNs]]
4. jQA Plugin: Fill in all transitive dependencies via Cypher queries

**Central Components:**
- `LCEDependency`: concept that represents a direct dependency observed in the code
	- for transitive dependencies see `DependencyResolver`
- `DependencyResolutionProcessor`: processor that resolves [[Node Properties - Fully Qualified Names|FQN]] references and collects registered dependencies within the AST
	- executed on the root node of the AST of each source file
	- registers [[Local Contexts]] that serve as indexes for registering declarations and dependencies within the module as well as schedule [[Node Properties - Fully Qualified Names|FQN]] resolutions at the end of the AST traversal
	- provides static utility methods for the construction of [[Node Properties - Fully Qualified Names|FQNs]] and the interaction with the [[Local Contexts]] from above
- `IdentifierDependencyProcessor`: processor that registers dependencies for all referenced identifiers within the code that are not part of one of the other processed declaration constructs
	- `MemberExpressionDependencyProcessor` handles dependency registration specifically for member expressions (e.g. `myObj.b`)
-  `ScopeProcessor`/`DeclarationScopeProcessor`: processors that register (un)named [[Node Properties - Fully Qualified Names|FQN]] scopes at all relevant points of the AST traversal to aid [[Node Properties - Fully Qualified Names|FQN]] construction
- `DependencyResolver` (Java): creates [[Node Relation - Dependencies|DEPENDS_ON]] relations for the extracted direct dependencies and fills in all transitive dependencies via Cypher queries
	- in a final step all [[Node Relation - Dependencies|DEPENDS_ON]] relations are aggregated