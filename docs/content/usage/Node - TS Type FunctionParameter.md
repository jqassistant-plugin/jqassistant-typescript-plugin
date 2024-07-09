---
aliases:
  - :TS:Type:FunctionParameter
---
# `:TS:Type:FunctionParameter` Node

-> represents a parameter of a [[Node - TS Type Function|:TS:Type:Function]]
- not to be confused with [[Node - TS Parameter|:TS:Parameter]] which is exclusive for [[Node - TS Function|:TS:Function]]

## Properties

| Name                 | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `index`              | position of the parameter in the parameter list (zero-based) |
| `name`               | name of the parameter                                        |
| `optional` (boolean) | indicates if the parameter is marked optional                |

## Relations

| Name      | Target Label(s)              | Cardinality | Description           |
| --------- | ---------------------------- | ----------- | --------------------- |
| `OF_TYPE` | [[Node - TS Type\|:TS:Type]] | 1           | type of the parameter |
