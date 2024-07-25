---
aliases:
  - :TS:Type:Declared
---
# `:TS:Type:Declared` Node

-> represents the type of a type declaration (i.e. a [[Node - TS Class|:TS:Class]])

## Properties

| Name                  | Description                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `referencedGlobalFqn` | [[Node Properties - Fully Qualified Names\|global FQN]] of the type declaration that is referenced by the type node (this mainly serves as a convenience property to simplify queries) |

## Relations

| Name                | Target Label(s)                                                                                                                                                                                                  | Cardinality | Description                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REFERENCES`        | [[Node - TS Class\|:TS:Class]]<br>[[Node - TS Interface\|:TS:Interface]]<br>[[Node - TS TypeAlias\|:TS:TypeAlias]]<br>[[Node - TS Enum\|:TS:Enum]]<br>[[Node - TS ExternalDeclaration\|:TS:ExternalDeclaration]] | 1           | declaration that defines the referenced type                                                                                                                |
| `HAS_TYPE_ARGUMENT` | [[Node - TS Type\|:TS:Type]]                                                                                                                                                                                     | 0..*        | type arguments that are specified for generic types<br>**Properties:** <br>- `index`: position of the type argument in the type parameter list (zero-based) |
