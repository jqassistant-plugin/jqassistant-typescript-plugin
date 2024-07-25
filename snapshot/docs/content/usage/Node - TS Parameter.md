---
aliases:
  - :TS:Parameter
---
# `:TS:Parameter` Node

-> represents a function/method parameter
- not to be confused with [[Node - TS Type FunctionParameter|:TS:Type:FunctionParameter]] which is exclusive for [[Node - TS Type Function|:TS:Type:Function]]

## Properties

| Name                                                     | Description                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| `index`                                                  | position of the parameter in the parameter list (zero-based)       |
| `name`                                                   | name of the parameter                                              |
| `optional` (boolean)                                     | indicates if the parameter is marked optional                      |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the parameter declaration (without `fileName`) |

## Relations

| Name           | Target Label(s)                        | Cardinality | Description                                                                                                    |
| -------------- | -------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `OF_TYPE`      | [[Node - TS Type\|:TS:Type]]           | 1           | type of the parameter                                                                                          |
| `DECLARES`     | [[Node - TS Property\|:TS:Property]]   | 0..1        | *only for [[Node - TS Constructor\|:TS:Constructor]] parameters:* reference to the declared parameter property |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]] | 0..*        | *only for [[Node - TS Class\|:TS:Class]] member parameters:* all decorators of the parameter                   |
