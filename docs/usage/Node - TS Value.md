---
aliases:
  - :TS:Value
---
# `:TS:Value` Node

-> represents a value (e.g. the initialization value of a variable)

**Only occurs as one of the following sub-variants:**
- [[Node - TS Value Declared|:TS:Value:Declared]]
- [[Node - TS Value Member|:TS:Value:Member]]
- [[Node - TS Value Object|:TS:Value:Object]] with [[Node - TS Value ObjectMember|:TS:Value:ObjectMember]]
- [[Node - TS Value Array|:TS:Value:Array]]
- [[Node - TS Value Call|:TS:Value:Call]]
- [[Node - TS Value Function|:TS:Value:Function]]
- [[Node - TS Value Class|:TS:Value:Class]]
- [[Node - TS Value Null|:TS:Value:Null]]
- [[Node - TS Value Literal|:TS:Value:Literal]]
- [[Node - TS Value Complex|:TS:Value:Complex]]

## Relations

| Name      | Target Label(s)              | Cardinality | Description       |
| --------- | ---------------------------- | ----------- | ----------------- |
| `OF_TYPE` | [[Node - TS Type\|:TS:Type]] | 1           | type of the value |
