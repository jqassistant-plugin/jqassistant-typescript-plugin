---
aliases:
  - :TS:AutoAccessor
---
# `:TS:AutoAccessor` Node

-> represents a declared auto accessor of a [[Node - TS Class|:TS:Class]] or [[Node - TS Interface|:TS:Interface]]

## Properties

| Name                                                     | Description                                                                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `visibility`                                             | visibility of the accessor, i.e. `public`(default), `protected`, `private`, or `js_private`(for auto accessors declared using the `#` prefix) |
| `static` (boolean)                                       | *only for [[Node - TS Class\|:TS:Class]] accessors:* indicates, if the accessor has an `static` modifier                                      |
| `abstract` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] accessors:* indicates, if the accessor has an `abstract` modifier                                    |
| `override` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] accessors:* indicates, if the accessor has an `override` modifier                                    |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the auto accessor declaration (without `fileName`)                                                                        |

## Relations

| Name           | Target Label(s)                        | Cardinality | Description                                                                                            |
| -------------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `OF_TYPE`      | [[Node - TS Type\|:TS:Type]]           | 1           | type of the described accessor property                                                                |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]] | 0..*        | *only for [[Node - TS Class\|:TS:Class]] accessors:* all decorators of the described accessor property |
