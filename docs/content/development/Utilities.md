# Utilities
-> there exist various utility modules in the TypeScript LCE to aid development

**Overview:**
- `FileUtils`: operations with files, directories and their paths
	- mainly used for normalizing file system paths to consistently use forward slashes (`normalizePath`)
- `ModulePathUtils`: operations on FQNs and the module paths contained within them
- `NodeUtils`: operations to call on Node-specific APIs for package name resolution, etc.
- `processor.utils.ts`: provides various functions to be used by [[Processors|processors]] for easy access to the various processed data structures 
- `traverser.utils.ts`: provides functions to be used by [[Traversers|traversers]] to better orchestrate the traversal process
- `ProjectUtils`: contains logic for project detection and information extraction