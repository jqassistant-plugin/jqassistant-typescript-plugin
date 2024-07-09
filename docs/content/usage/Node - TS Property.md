---
aliases:
  - :TS:Property
---
# `:TS:Property` Node

-> represents a declared property of a [[Node - TS Class|:TS:Class]] or [[Node - TS Interface|:TS:Interface]]

## Properties

| Name                                                     | Description                                                                                                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the property                                                                   |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the property                                                                    |
| `name`                                                   | name of the property                                                                                                                      |
| `optional` (boolean)                                     | indicates, if the property has been declared optional/nullable via a `?` suffix                                                           |
| `readonly` (boolean)                                     | indicates, if the property has a `readonly` modifier                                                                                      |
| `visibility`                                             | visibility of the property, i.e. `public`(default), `protected`, `private`, or `js_private`(for properties declared using the `#` prefix) |
| `static` (boolean)                                       | *only for [[Node - TS Class\|:TS:Class]] properties:* indicates, if the property has an `static` modifier                                 |
| `abstract` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] properties:* indicates, if the property has an `abstract` modifier                               |
| `override` (boolean)                                     | *only for [[Node - TS Class\|:TS:Class]] properties:* indicates, if the property has an `override` modifier                               |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the property declaration (without `fileName`)                                                                         |

## Relations

| Name           | Target Label(s)                                                              | Cardinality | Description                                                                          |
| -------------- | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `OF_TYPE`      | [[Node - TS Type\|:TS:Type]]                                                 | 1           | type of the property                                                                 |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]]                                       | 0..*        | *only for [[Node - TS Class\|:TS:Class]] properties:* all decorators of the property |
| `DEPENDS_ON`   | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the property                       |

