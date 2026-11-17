---
aliases:
  - dependencies
  - DEPENDS_ON
---
# Dependencies (`DEPENDS_ON`)
-> dependencies between the various language concepts are realized by the `DEPENDS_ON` relation
- direct dependencies are registered on a statement/expression level and propagated upwards to the next language construct that is represented as a concept in the graph 
	- import statements are ignored during this process which means declarations of unused imports will not be represented in the graph
- re-exports are resolved transitively as far as possible, that means dependencies are always targeting the original declaration, never some intermediary re-exporting module
	- this applies to type references as well as to value references (e.g. function calls, `new` expressions, reading a constant)
	- it covers `export * from`, named and aliased re-exports (`export { A as B } from`), default re-exports (`export { default } from`) and namespace re-exports (`export * as ns from`), also when declarations of Node.js packages are re-exported
	- a module that re-exports declarations depends on the re-exported declarations (named re-exports) or modules (`export *`)
- dependencies whose source or target is not represented in the graph are skipped; the plugin logs their number (details on debug level), and the LCE tool lists them when run with `--debug`
- all registered direct dependencies of a concept are propagated/aggregated to all declaration levels above (see [[#Propagation/Aggregation Strategy]])

**Properties:**

| Name          | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| `cardinality` | number of usages of the specific dependencies inside the language construct |

## Origin Nodes
-> nodes from which `DEPENDS_ON` relationships can originate

**Core:**
- [[Node - TS Module|:TS:Module]]
- [[Node - TS Class|:TS:Class]]
- [[Node - TS Property|:TS:Property]]
- [[Node - TS Method|:TS:Method]]
- [[Node - TS AccessorProperty|:TS:AccessorProperty]]
- [[Node - TS Interface|:TS:Interface]]
- [[Node - TS TypeAlias|:TS:TypeAlias]]
- [[Node - TS Enum|:TS:Enum]]
- [[Node - TS Variable|:TS:Variable]]
- [[Node - TS Function|:TS:Function]]

**React Extension:**
- [[Node - TS JSXElementType|:TS:JSXElementType]]
## Target Nodes
-> nodes to which `DEPENDS_ON` relationships can point to
- [[Node - TS Module|:TS:Module]]
- [[Node - TS ExternalModule|:TS:ExternalModule]]
- [[Node - TS ExternalDeclaration|:TS:ExternalDeclaration]]
- [[Node - TS Class|:TS:Class]]
- [[Node - TS Property|:TS:Property]]
- [[Node - TS Method|:TS:Method]]
- [[Node - TS AccessorProperty|:TS:AccessorProperty]]
- [[Node - TS Interface|:TS:Interface]]
- [[Node - TS TypeAlias|:TS:TypeAlias]]
- [[Node - TS Enum|:TS:Enum]]
- [[Node - TS Variable|:TS:Variable]]
- [[Node - TS Function|:TS:Function]]

## Propagation/Aggregation Strategy
-> dependencies that are registered at some level in the declaration hierarchy are registered on that level (e.g. at a property declaration) as well as on all the levels above (e.g. the containing class and module) where they are then aggregated with other existing dependencies
- this is done for *both* origin, and target of the dependency

**Example:**
*a.ts*
```ts
export class A {
	run(b: B): void {
		b.prop = 5;
	}
}
```

*b.ts*
```ts
export class B {
	public prop: number = 0;
}
```

1. There are two direct dependencies that are detected in *a.ts*:
	- the class `B` is used once by the method `run` as the type for the parameter `b`
	- the property `prop` is used once by the method `run` in its assignment statement

The following propagations/aggregations take place:

2. Target propagation:
	- the direct dependency to the method is propagated upwards to the class level where it is combined with the existing direct dependency to the class (leading to a combined cardinality of `2`)
	- the dependency to the class (with the aggregated cardinality of `2`) is propagated up once more to the module level
3. Source propagation:
	- the previously calculated dependencies that originate from the method are now propagated up to its containing class and module respectively

![[jqa-ts-plugin-dependency-example.jpg]]

