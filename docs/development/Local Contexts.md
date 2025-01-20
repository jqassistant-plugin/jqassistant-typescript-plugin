# Local Contexts
-> [Local Contexts](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Local-Contexts) are implemented by the `LocalContexts` class
- located under `typescript/src/core/context.ts`

**General Usage Rules:**
- child node [[Processors|processors]] should know as little as possible about their parents and should instead receive their information for execution conditions and concept extraction from local contexts (-> increase re-usability)
- the context keys are stored in a central class that is specific for each extension (e.g. `CoreContextKeys` and `ReactContextKeys`) that is located in an extension-level module named `context.keys.ts`