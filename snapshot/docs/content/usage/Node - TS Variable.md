---
aliases:
  - :TS:Variable
---
# `:TS:Variable` Node

-> represents a top-level TypeScript variable/constant declaration

## Properties

| Name                                                     | Description                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the variable |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the variable  |
| `name`                                                   | name of the variable                                                    |
| `kind`                                                   | type of the variable declaration, i.e. `var`, `let`, or `const`         |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the variable declaration (includes `fileName`)      |

## Relations

| Name               | Target Label(s)                                                              | Cardinality | Description                                                    |
| ------------------ | ---------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `OF_TYPE`          | [[Node - TS Type\|:TS:Type]]                                                 | 1           | type of the variable                                           |
| `INITIALIZED_WITH` | [[Node - TS Value\|:TS:Value]]                                               | 0..1        | initialization value of the variable                           |
| `DEPENDS_ON`       | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the variable |
