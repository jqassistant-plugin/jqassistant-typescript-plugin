---
aliases:
  - :TS:Type:Function
---
# `:TS:Type:Function` Node

-> represents a function type

## Properties

| Name              | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `async` (boolean) | indicates, if the function type has an `async` modifier |

## Relations

| Name            | Target Label(s)                                                  | Cardinality | Description                                            |
| --------------- | ---------------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| `DECLARES`      | [[Node - TS TypeParameter\|:TS:TypeParameter]]                   | 0..*        | type parameters that are declared by the function type |
| `RETURNS`       | [[Node - TS Type\|:TS:Type]]                                     | 1           | return type of the function type                       |
| `HAS_PARAMETER` | [[Node - TS Type FunctionParameter\|:TS:Type:FunctionParameter]] | 0..*        | parameters of the function type                        |
