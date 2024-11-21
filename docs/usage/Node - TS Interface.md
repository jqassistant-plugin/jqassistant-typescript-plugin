---
aliases:
  - :TS:Interface
---
# `:TS:Interface` Node

-> represents a top-level TypeScript interface declaration

## Properties

| Name                                                     | Description                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the interface |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the interface  |
| `name`                                                   | name of the interface                                                    |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the interface declaration (includes `fileName`)      |

## Relations

| Name         | Target Label(s)                                                                                                                  | Cardinality | Description                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------- |
| `DECLARES`   | [[Node - TS TypeParameter\|:TS:TypeParameter]]                                                                                   | 0..*        | type parameters that are declared by the interface              |
| `EXTENDS`    | [[Node - TS Type Declared\|:TS:Type:Declared]]                                                                                   | 0..*        | type reference to the base interface(s)                         |
| `DECLARES`   | [[Node - TS Property\|:TS:Property]]<br>[[Node - TS Method\|:TS:Method]]<br>[[Node - TS AccessorProperty\|:TS:AccessorProperty]] | 0..*        | all declared members of the interface                           |
| `DEPENDS_ON` | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]]                                                     | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the interface |

