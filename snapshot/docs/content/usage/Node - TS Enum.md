---
aliases:
  - :TS:Enum
---
# `:TS:Enum` Node

-> represents a top-level TypeScript enum declaration

## Properties

| Name                                                     | Description                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the enum |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the enum  |
| `name`                                                   | name of the enum                                                    |
| `constant` (boolean)                                     | indicates, if the enum has a `const` modifier                       |
| `declared` (boolean)                                     | indicates, if the enum has a `declare` modifier                     |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the enum declaration (includes `fileName`)      |

## Relations

| Name         | Target Label(s)                                                              | Cardinality | Description                                                |
| ------------ | ---------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------- |
| `DECLARES`   | [[Node - TS EnumMember\|:TS:EnumMember]]                                     | 0..*        | all elements of the enum                                   |
| `DEPENDS_ON` | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the enum |
