---
aliases:
  - :TS:Project
---
# `:TS:Project` Node

-> represents an individual TypeScript project
- identified via a `tsconfig.json` file

## Relations

| Name         | Target Label(s)                                  | Cardinality | Description                                                                                                                                                         |
| ------------ | ------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HAS_CONFIG` | `File:Local`                                     | 1           | `tsconfig.json` file node                                                                                                                                           |
| `HAS_ROOT`   | `File:Local`                                     | 1           | either the directory of the `tsconfig.json` or the [rootDir](https://www.typescriptlang.org/tsconfig#rootDir) path, if it is located above the `tsconfig.json` path |
| `REFERENCES` | [[Node - TS Project\|:TS:Project]]               | 0..*        | sub-projects as they are defined via the `references` `tsconfig.json` property                                                                                      |
| `CONTAINS`   | [[Node - TS Module\|:TS:Module]]                 | 0..*        | all scanned modules that are contained within the project (does not include modules of referenced sub-projects)                                                     |
| `USES`       | [[Node - TS ExternalModule\|:TS:ExternalModule]] | 0..*        | all external modules that are referenced somewhere inside the scanned project modules                                                                               |
