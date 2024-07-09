---
aliases:
  - :TS:ReactComponent
---
# `:TS:ReactComponent` Node

-> represents a React component definition
- acts as an extension to either a [[Node - TS Class|:TS:Class]], [[Node - TS Function|:TS:Function]], or [[Node - TS Variable|:TS:Variable]] node

## Properties

| Name            | Description           |
| --------------- | --------------------- |
| `componentName` | name of the component |

## Relations

| Name      | Target Label(s)                                  | Cardinality | Description                                                                                                                                                |
| --------- | ------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RENDERS` | [[Node - TS JSXElementType\|:TS:JSXElementType]] | 0..*        | elements/components that are used (and potentially rendered) by the component<br>**Properties:**<br>- `cardinality`: number of usages inside the component |
