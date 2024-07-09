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
| `startLine`   | starting line of the code construct                               |
| `startColumn` | starting column of the code construct                             |
| `endLine`     | end line of the code construct                                    |
| `endColumn`   | end column of the code construct                                  |

- all line and column numbers start counting at `0`