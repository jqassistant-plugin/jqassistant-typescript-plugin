---
aliases:
  - :TS:EnumMember
---
# `:TS:EnumMember` Node

-> represents a TypeScript enum element

## Properties

| Name                                                     | Description                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the enum member |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the enum member  |
| `name`                                                   | name of the enum member                                                    |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the enum member (without `fileName`)                   |

## Relations

| Name               | Target Label(s)                | Cardinality | Description                                  |
| ------------------ | ------------------------------ | ----------- | -------------------------------------------- |
| `INITIALIZED_WITH` | [[Node - TS Value\|:TS:Value]] | 0..1        | explicitly assigned value of the enum member |
