---
aliases:
  - :TS:Value:Member
---
# `:TS:Value:Member` Node

-> represents a member relationship (i.e. the access of an object member via something like `obj.member`)

## Relations

| Name     | Target Label(s)                | Cardinality | Description                                       |
| -------- | ------------------------------ | ----------- | ------------------------------------------------- |
| `PARENT` | [[Node - TS Value\|:TS:Value]] | 1           | value of the parent of which a member is accessed |
| `MEMBER` | [[Node - TS Value\|:TS:Value]] | 1           | value of the member                               |
