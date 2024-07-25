---
aliases:
  - :TS:Value:Declared
---
# `:TS:Value:Declared` Node

-> represents a value that is declared somewhere else (i.e. a variable)

## Properties

| Name                  | Description                                                                                                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `referencedGlobalFqn` | [[Node Properties - Fully Qualified Names\|global FQN]] of the value declaration that is referenced by the value node (this mainly serves as a convenience property to simplify queries) |


## Relations

| Name         | Target Label(s)                                                                                                                                                                                                                                          | Cardinality | Description                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------- |
| `REFERENCES` | [[Node - TS Variable\|:TS:Variable]]<br>[[Node - TS Function\|:TS:Function]]<br>[[Node - TS Class\|:TS:Class]]<br>[[Node - TS Enum\|:TS:Enum]]<br>[[Node - TS EnumMember\|:TS:EnumMember]]<br>[[Node - TS ExternalDeclaration\|:TS:ExternalDeclaration]] | 1           | declaration that defines the referenced value |
