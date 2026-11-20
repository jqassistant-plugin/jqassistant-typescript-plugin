---
aliases:
  - code coordinates
---
# Code Coordinates
-> set of node properties that describe the location of a code construct within a source code file

**Properties:**

| Name          | Description                                                       |
| ------------- | ----------------------------------------------------------------- |
| `fileName`    | absolute path to the source file of the code construct (optional) |
| `startLine`   | line of the first character of the code construct                 |
| `startColumn` | column of the first character of the code construct               |
| `endLine`     | line of the last character of the code construct                  |
| `endColumn`   | column behind the last character of the code construct            |

- line numbers start counting at `1`, column numbers at `0`
- `endColumn` points behind the last character: `enum E {}` at the beginning of the first line has `startLine` 1, `startColumn` 0, `endLine` 1 and `endColumn` 9
- the coordinates of an exported declaration start behind the `export` (or `export default`) keyword
- `fileName` is only set on top-level declarations ([[Node - TS Class|:TS:Class]], [[Node - TS Interface|:TS:Interface]], [[Node - TS TypeAlias|:TS:TypeAlias]], [[Node - TS Enum|:TS:Enum]], [[Node - TS Function|:TS:Function]], [[Node - TS Variable|:TS:Variable]]); members, parameters and decorators carry line and column numbers only
