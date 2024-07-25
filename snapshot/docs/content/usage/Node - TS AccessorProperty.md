---
aliases:
  - :TS:AccessorProperty
---
# `:TS:AccessorProperty` Node

-> represents a property of a [[Node - TS Class|:TS:Class]] or [[Node - TS Interface|:TS:Interface]] that is described by getter, setter, or auto accessor constructs

## Properties

| Name        | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| `globalFqn` | [[Node Properties - Fully Qualified Names\|global FQN]] of the accessor property |
| `localFqn`  | [[Node Properties - Fully Qualified Names\|local FQN]] of the accessor property  |
| `name`      | name of the accessor property                                                    |

## Relations

| Name                         | Target Label(s)                                                              | Cardinality | Description                                                                |
| ---------------------------- | ---------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| `DESCRIBED_BY_AUTO_ACCESSOR` | [[Node - TS AutoAccessor\|:TS:AutoAccessor]]<br>                             | 0..1        | auto accessor that describes the property                                  |
| `DESCRIBED_BY_GETTER`        | [[Node - TS Getter\|:TS:Getter]]                                             | 0..1        | getter that describes the property                                         |
| `DESCRIBED_BY_SETTER`        | [[Node - TS Setter\|:TS:Setter]]                                             | 0..1        | setter that describes the property                                         |
| `DEPENDS_ON`                 | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]] | 0..*        | [[Node Relation - Dependencies\|dependencies]] of all describing accessors |
