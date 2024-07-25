---
aliases:
  - :TS:Value:ObjectMember
---
# `:TS:Value:ObjectMember` Node

-> represents a member of a [[Node - TS Value Object|:TS:Value:Object]]

## Properties

| Name   | Description               |
| ------ | ------------------------- |
| `name` | name of the object member |

## Relations

| Name         | Target Label(s)                | Cardinality | Description                |
| ------------ | ------------------------------ | ----------- | -------------------------- |
| `REFERENCES` | [[Node - TS Value\|:TS:Value]] | 1           | value of the object member |
