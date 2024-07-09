---
aliases:
  - :TS:Value:Call
---
# `:TS:Value:Call` Node

-> represents the return value of a function call of some value

## Relations

| Name                | Target Label(s)                | Cardinality | Description                                                                                                                                                 |
| ------------------- | ------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CALLS`             | [[Node - TS Value\|:TS:Value]] | 1           | value on which the call is performed on                                                                                                                     |
| `HAS_ARGUMENT`      | [[Node - TS Value\|:TS:Value]] | 0..*        | arguments of the call<br>**Properties:**<br>- `index`: position of the argument in the parameter list                                                       |
| `HAS_TYPE_ARGUMENT` | [[Node - TS Type\|:TS:Type]]   | 0..*        | type arguments that are specified for generic calls<br>**Properties:** <br>- `index`: position of the type argument in the type parameter list (zero-based) |
