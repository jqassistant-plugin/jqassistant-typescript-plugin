---
aliases:
  - :TS:Type:Object
---
# `:TS:Type:Object` Node

-> represents an object type

## Relations

| Name         | Target Label(s)                                        | Cardinality | Description                                                            |
| ------------ | ------------------------------------------------------ | ----------- | ---------------------------------------------------------------------- |
| `HAS_MEMBER` | [[Node - TS Type ObjectMember\|:TS:Type:ObjectMember]] | 0..*        | members of the object type (with references to their respective types) |
