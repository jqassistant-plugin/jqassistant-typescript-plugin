---
aliases:
  - local FQN
  - global FQN
  - FQN
---
# Fully Qualified Names (FQNs)
-> node properties that uniquely identify a concept within or across projects

**Properties:**

| Name        | Description                                                                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globalFqn` | Global fully qualified name that uniquely identifies the code construct across all scanned projects.                                                                                                                                                                                                                    |
| `localFqn`  | Local fully qualified name that uniquely identifies the code construct within its containing project.<br>This property mainly serves convenience purposes as it is shorter and, therefore, easier to handle than the `globalFqn`.<br>In contrast to the `globalFqn`, this identifier is also independent of the machine |

**`globalFqn` Examples:**
- `/home/myuser/dev/my-project/src/my-module.ts` for a [[Node - TS Module|:TS:Module]]
- `"/home/myuser/dev/my-project/src/my-module.ts".myClass` for global declarations (like [[Node - TS Class|:TS:Class]])
- `"some-package".someDeclaration` for external declarations from Node.js packages ([[Node - TS ExternalDeclaration|:TS:ExternalDeclaration]])
- `"/home/myuser/dev/my-project/src/my-module.ts".myClass.someMethod` for declaration members (like [[Node - TS Method|:TS:Method]])

**`localFqn` Examples:**
- `./src/my-module.ts` for a [[Node - TS Module|:TS:Module]]
- `"./src/my-module.ts".myClass` for global declarations (like [[Node - TS Class|:TS:Class]])
- `"some-package".someDeclaration` for external declarations from Node.js packages ([[Node - TS ExternalDeclaration|:TS:ExternalDeclaration]])
- `"./src/my-module.ts".myClass.someMethod` for declaration members (like [[Node - TS Method|:TS:Method]])

> [!note]
>  For declarations that are part of a `index.ts`(`x`) module, the module path ends with the containing directory, omitting the file name.  
> E.g. a `localFqn` for the class `MyClass` in the file `./some/path/index.ts` would look like `"./some/path".MyClass`.

> [!note]
> A default-exported declaration uses the identifier `default` instead of its name, the name stays available in the `name` property.
> This applies to all ways of default-exporting a declaration (`export default class MyClass {}`, `export default MyClass;` and `export { MyClass as default };`) and to all kinds of declarations.
> E.g. the `localFqn` of `MyClass` in the file `./src/my-module.ts` would look like `"./src/my-module.ts".default`, also if `MyClass` is exported by name in addition.