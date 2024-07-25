---
aliases:
  - :TS:Type:ObjectMember
---
# `:TS:Type:ObjectMember` Node

-> represents a member of an [[Node - TS Type Object|:TS:Type:Object]]

## Properties

| Name                 | Description                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| `name`               | name of the member                                                            |
| `optional` (boolean) | indicates, if the member has been declared optional/nullable via a `?` suffix |
| `readonly` (boolean) | indicates, if the member has a `readonly` modifier                            |

## Relations

| Name      | Target Label(s)              | Cardinality | Description        |
| --------- | ---------------------------- | ----------- | ------------------ |
| `OF_TYPE` | [[Node - TS Type\|:TS:Type]] | 1           | type of the member |
