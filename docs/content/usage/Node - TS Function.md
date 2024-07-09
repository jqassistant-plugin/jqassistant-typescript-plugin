---
aliases:
  - :TS:Function
---
# `:TS:Function` Node

-> represents a top-level TypeScript function declaration
- not to be confused with [[Node - TS Type Function|:TS:Type:Function]], which represents a function *type*

## Properties

| Name                                                     | Description                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the function |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the function  |
| `name`                                                   | name of the function                                                    |
| `async` (boolean)                                        | indicates, if the function has an `async` modifier                      |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the function declaration (includes `fileName`)      |

## Relations

| Name         | Target Label(s)                                                              | Cardinality | Description                                                    |
| ------------ | ---------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `DECLARES`   | [[Node - TS TypeParameter\|:TS:TypeParameter]]                               | 0..*        | type parameters that are declared by the function              |
| `RETURNS`    | [[Node - TS Type\|:TS:Type]]                                                 | 1           | return type of the function                                    |
| `HAS`        | [[Node - TS Parameter\|:TS:Parameter]]                                       | 0..*        | parameters of the function                                     |
| `DEPENDS_ON` | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the function |
