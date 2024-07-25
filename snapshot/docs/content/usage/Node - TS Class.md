---
aliases:
  - :TS:Class
---
# `:TS:Class` Node

-> represents a top-level TypeScript class declaration

## Properties

| Name                                                     | Description                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `globalFqn`                                              | [[Node Properties - Fully Qualified Names\|global FQN]] of the class |
| `localFqn`                                               | [[Node Properties - Fully Qualified Names\|local FQN]] of the class  |
| `name`                                                   | name of the class                                                    |
| `abstract` (boolean)                                     | indicates, if the class has an `abstract` modifier                   |
| [[Node Properties - Code Coordinates\|code coordinates]] | code coordinates of the class declaration (includes `fileName`)      |


## Relations

| Name           | Target Label(s)                                                                                                                  | Cardinality | Description                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `DECLARES`     | [[Node - TS TypeParameter\|:TS:TypeParameter]]                                                                                   | 0..*        | type parameters that are declared by the class              |
| `EXTENDS`      | [[Node - TS Type Declared\|:TS:Type:Declared]]                                                                                   | 0..1        | type reference to the base class                            |
| `IMPLEMENTS`   | [[Node - TS Type Declared\|:TS:Type:Declared]]                                                                                   | 0..*        | type reference to all implemented interfaces                |
| `DECLARES`     | [[Node - TS Constructor\|:TS:Constructor]]                                                                                       | 0..1        | the constructor of the class                                |
| `DECLARES`     | [[Node - TS Property\|:TS:Property]]<br>[[Node - TS Method\|:TS:Method]]<br>[[Node - TS AccessorProperty\|:TS:AccessorProperty]] | 0..*        | all declared members of the class                           |
| `DECORATED_BY` | [[Node - TS Decorator\|:TS:Decorator]]                                                                                           | 0..*        | all decorators of the class declaration                     |
| `DEPENDS_ON`   | see [[Node Relation - Dependencies#Target Nodes\|DEPENDS_ON - Target Nodes]]                                                     | 0..*        | [[Node Relation - Dependencies\|dependencies]] of the class |
