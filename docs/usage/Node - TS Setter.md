---
aliases:
  - :TS:Setter
---
# `:TS:Setter` Node

-> represents a declared setter of a [[Node - TS Class|:TS:Class]] or [[Node - TS Interface|:TS:Interface]]

## Properties

| Name                                                     | Description                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `visibility`                                             | visibility of the setter, i.e. `public`(default), `protected`, `private`, or `js_private`(for setters declared using the `#` prefix) |
| `static` (boolean)                                       | *only for [[Node - TS Class\|:TS:Class]] setters:* indicates, if the setter has an `static` modifier                                 |
| `abstract` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] setters:* indicates, if the setter has an `abstract` modifier                               |
| `override` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] setters:* indicates, if the setter has an `override` modifier                               |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the setter declaration (without `fileName`)                                                                      |

## Relations

| Name           | Target Label(s)                        | Cardinality | Description                                                                     |
| -------------- | -------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `HAS`          | [[Node - TS Parameter\|:TS:Parameter]] | 0..*        | parameter(s) of the setter                                                      |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]] | 0..*        | *only for [[Node - TS Class\|:TS:Class]] setters:* all decorators of the setter |
