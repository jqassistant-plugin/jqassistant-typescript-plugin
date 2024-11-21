---
aliases:
  - :TS:Value:Object
---
# `:TS:Value:Object` Node

-> represents an object value

## Relations

| Name         | Target Label(s)                                          | Cardinality | Description                                                         |
| ------------ | -------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| `HAS_MEMBER` | [[Node - TS Value ObjectMember\|:TS:Value:ObjectMember]] | 0..*        | members of the object (with references to their respective values+) |
