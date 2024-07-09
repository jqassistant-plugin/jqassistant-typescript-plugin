---
aliases:
  - :TS:TypeParameter
---
# `:TS:TypeParameter` Node

-> represents a type parameter for a generic [[Node - TS Function|:TS:Function]] or [[Node - TS Method|:TS:Method]]

## Properties

| Name    | Description                                                            |
| ------- | ---------------------------------------------------------------------- |
| `name`  | name of the type parameter                                             |
| `index` | position of the type parameter in the type parameter list (zero-based) |

## Relations

| Name             | Target Label(s)              | Cardinality | Description                                                                                        |
| ---------------- | ---------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `CONSTRAINED_BY` | [[Node - TS Type\|:TS:Type]] | 1           | type constraint for the type parameter (default: empty [[Node - TS Type Object\|:TS:Type:Object]]) |
