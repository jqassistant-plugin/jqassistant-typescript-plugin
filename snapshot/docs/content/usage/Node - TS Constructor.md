---
aliases:
  - :TS:Constructor
---
# `:TS:Constructor` Node

-> represents a TypeScript class constructor declaration

## Properties

| Name                                                     | Description                                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the constructor (always ends with `.constructor`) |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the constructor (always ends with `.constructor`)  |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the constructor declaration (without `fileName`)                                         |


## Relations

| Name  | Target Label(s)                        | Cardinality | Description                                                                 |
| ----- | -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `HAS` | [[Node - TS Parameter\|:TS:Parameter]] | 0..*        | parameters of the constructor (may reference declared parameter properties) |
