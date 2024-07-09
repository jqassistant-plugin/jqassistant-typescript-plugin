---
aliases:
  - :TS:Module
---
# `:TS:Module` Node

-> represents a TypeScript module (a single `.ts(x)` file)
- is realized as an extension of the matching `:File:Local` node
	- `fileName` is relative to the [[Node - TS Project|:TS:Project]] root directory

## Properties

| Name        | Description                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `globalFqn` | [[Node Properties - Fully Qualified Names\|global FQN]] of the module (absolute file path identical to `absoluteFileName`) |
| `localFqn`  | [[Node Properties - Fully Qualified Names\|local FQN]] of the module (relative file path identical to `fileName`)          |

## Relations

| Name         | Target Label(s)                                                                                                                                                                                                                    | Cardinality | Description                                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DECLARES`   | [[Node - TS TypeAlias\|:TS:TypeAlias]]<br>[[Node - TS Class\|:TS:Class]]<br>[[Node - TS Interface\|:TS:Interface]]<br>[[Node - TS Enum\|:TS:Enum]]<br>[[Node - TS Function\|:TS:Function]]<br>[[Node - TS Variable\|:TS:Variable]] | 0..*        | all global declarations of the module                                                                                                                                     |
| `EXPORTS`    | [[Node - TS TypeAlias\|:TS:TypeAlias]]<br>[[Node - TS Class\|:TS:Class]]<br>[[Node - TS Interface\|:TS:Interface]]<br>[[Node - TS Enum\|:TS:Enum]]<br>[[Node - TS Function\|:TS:Function]]<br>[[Node - TS Variable\|:TS:Variable]] | 0..*        | additional relation to all global declarations that are exported by the module<br>**Properties:**<br>- `exportedName`: name of the declaration under which it is exported |
| `DEPENDS_ON` | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]]                                                                                                                                                       | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the module                                                                                                              |

