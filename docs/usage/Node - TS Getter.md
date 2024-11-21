---
aliases:
  - :TS:Getter
---
# `:TS:Getter` Node

-> represents a declared getter of a [[Node - TS Class|:TS:Class]] or [[Node - TS Interface|:TS:Interface]]

## Properties

| Name                                                     | Description                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `visibility`                                             | visibility of the getter, i.e. `public`(default), `protected`, `private`, or `js_private`(for getters declared using the `#` prefix) |
| `static` (boolean)                                       | *only for [[Node - TS Class\|:TS:Class]] getters:* indicates, if the getter has an `static` modifier                                 |
| `abstract` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] getters:* indicates, if the getter has an `abstract` modifier                               |
| `override` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] getters:* indicates, if the getter has an `override` modifier                               |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the getter declaration (without `fileName`)                                                                      |

## Relations

| Name           | Target Label(s)                        | Cardinality | Description                                                                     |
| -------------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `RETURNS`      | [[Node - TS Type\|:TS:Type]]           | 1           | return type of the getter                                                       |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]] | 0..*        | *only for [[Node - TS Class\|:TS:Class]] getters:* all decorators of the getter |
