---
aliases:
  - :TS:Value:Array
---
# `:TS:Value:Array` Node

-> represents an array value

## Relations

| Name       | Target Label(s)                | Cardinality | Description                                                                                                          |
| ---------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `CONTAINS` | [[Node - TS Value\|:TS:Value]] | 0..*        | values of the individual array items<br>**Properties:**<br>- `index`: position of the item in the array (zero-based) |
