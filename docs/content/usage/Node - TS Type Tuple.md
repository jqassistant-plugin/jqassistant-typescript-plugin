---
aliases:
  - :TS:Type:Tuple
---
# `:TS:Type:Tuple` Node

-> represents a tuple type

## Relations

| Name       | Target Label(s)              | Cardinality | Description                                                                                              |
| ---------- | ---------------------------- | ----------- | -------------------------------------------------------------------------------------------------------- |
| `CONTAINS` | [[Node - TS Type\|:TS:Type]] | 1..*        | types of the tuple items<br>**Properties:**<br>- `index`: position of the item in the tuple (zero-based) |
