---
aliases:
  - :TS:JSXElementType
---
# `:TS:JSXElementType` Node

-> represents an element type that is used as a JSX element

## Properties

| Name        | Description                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `globalFqn` | [[Node Properties - Fully Qualified Names\|global FQN]] of the element (either equal to the [[Node Properties - Fully Qualified Names\|global FQN]] of a referenced [[Node - TS ReactComponent\|:TS:ReactComponent]], or equal to `name` for native HTML elements) |
| `name`      | name of the element                                                                                                                                                                                                                                                |

## Relations

| Name         | Target Label(s)                                                              | Cardinality | Description                                                                                |
| ------------ | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `REFERENCES` | [[Node - TS ReactComponent\|:TS:ReactComponent]]                             | 0..1        | React component that represents the used element                                           |
| `DEPENDS_ON` | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the element (any referenced declaration) |
