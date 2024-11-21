---
aliases:
  - :TS:ExternalModule
---
# `:TS:ExternalModule` Node

-> represents a TypeScript module that is not directly part of a scanned [[Node - TS Project|:TS:Project]]
- usually parts of imported Node.js libraries, etc.

## Properties

| Name        | Description                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `globalFqn` | [[Node Properties - Fully Qualified Names\|global FQN]] of the external module (either absolute path to the source or name of the Node.js package) |

## Relations

| Name      | Target Label(s)                                            | Cardinality | Description                                                                                                                                                 |
| --------- | ---------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPORTS` | [[Node - TS ExternalDeclaration\|:TS:ExternalDeclaration]] | 0..*        | declarations of the external module that are used somewhere in the scanned project modules<br>**Properties:** <br>- `exportedName`: name of the declaration |

