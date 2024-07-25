---
aliases:
  - :TS:Type:TypeParameterReference
---
# `:TS:Type:TypeParameterReference` Node

-> represents a reference to a generic type that is defined in a type parameter list

## Properties

| Name   | Description                |
| ------ | -------------------------- |
| `name` | name of the type parameter |

## Relations

| Name         | Target Label(s)                                | Cardinality | Description               |
| ------------ | ---------------------------------------------- | ----------- | ------------------------- |
| `REFERENCES` | [[Node - TS TypeParameter\|:TS:TypeParameter]] | 1           | referenced type parameter |
