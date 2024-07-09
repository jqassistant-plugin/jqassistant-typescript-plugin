---
aliases:
  - :TS:TypeAlias
---
# `:TS:TypeAlias` Node

-> represents a top-level TypeScript type alias declaration

## Properties

| Name                                                     | Description                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the type alias |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the type alias  |
| `name`                                                   | name of the type alias                                                    |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the type alias declaration (includes `fileName`)      |



## Relations

| Name         | Target Label(s)                                                              | Cardinality | Description                                                                         |
| ------------ | ---------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `OF_TYPE`    | [[Node - TS Type\|:TS:Type]]                                                 | 1           | type that the type alias represents                                                 |
| `DECLARES`   | [[Node - TS TypeParameter\|:TS:TypeParameter]]                               | 0..*        | type parameters that are declared by the type alias for use in the represented type |
| `DEPENDS_ON` | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the type alias                    |


