---
aliases:
  - :TS:Decorator
---
# `:TS:Decorator` Node

-> represents a decorator of a declaration

## Properties

| Name                                                     | Description                                            |
| -------------------------------------------------------- | ------------------------------------------------------ |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the decorator (without `fileName`) |

## Relations

| Name        | Target Label(s)                | Cardinality | Description                      |
| ----------- | ------------------------------ | ----------- | -------------------------------- |
| `HAS_VALUE` | [[Node - TS Value\|:TS:Value]] | 1           | value representing the decorator |
