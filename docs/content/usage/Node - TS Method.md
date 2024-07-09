---
aliases:
  - :TS:Method
---
# `:TS:Method` Node

-> represents a declared method of a [[Node - TS Class|:TS:Class]] or [[Node - TS Interface|:TS:Interface]]

## Properties

| Name                                                     | Description                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the method                                                                |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the method                                                                 |
| `name`                                                   | name of the method                                                                                                                   |
| `visibility`                                             | visibility of the method, i.e. `public`(default), `protected`, `private`, or `js_private`(for methods declared using the `#` prefix) |
| `async` (boolean)                                        | indicates, if the method has an `async` modifier                                                                                     |
| `static` (boolean)                                       | *only for [[Node - TS Class\|:TS:Class]] properties:* indicates, if the method has an `static` modifier                              |
| `abstract` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] properties:* indicates, if the method has an `abstract` modifier                            |
| `override` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] properties:* indicates, if the method has an `override` modifier                            |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the method declaration (without `fileName`)                                                                      |

## Relations

| Name           | Target Label(s)                                                              | Cardinality | Description                                                                     |
| -------------- | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `DECLARES`     | [[Node - TS TypeParameter\|:TS:TypeParameter]]                               | 0..*        | type parameters that are declared by the method                                 |
| `RETURNS`      | [[Node - TS Type\|:TS:Type]]                                                 | 1           | return type of the method                                                       |
| `HAS`          | [[Node - TS Parameter\|:TS:Parameter]]                                       | 0..*        | parameters of the method                                                        |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]]                                       | 0..*        | *only for [[Node - TS Class\|:TS:Class]] methods:* all decorators of the method |
| `DEPENDS_ON`   | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the method                    |

