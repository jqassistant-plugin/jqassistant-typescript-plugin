# AGENTS.md

Guidance for AI coding agents (and new contributors) working in this repository.
It summarizes the architecture and the conventions the code follows, and points to the existing documentation instead of repeating it.

## What this repository is

The TypeScript plugin for [jQAssistant](https://jqassistant.org). It turns TypeScript source code into a Neo4j graph in two steps:

```
TypeScript sources ──(LCE tool, typescript/)──> JSON report ──(jQA plugin, java/)──> graph
```

1. **LCE tool** (`typescript/`, npm package `@jqassistant/ts-lce`, CLI `jqa-ts-lce`): a TypeScript CLI that extracts *language concepts* and writes them to `<scan root>/.reports/jqa/ts-output.json`.
2. **jQA plugin** (`java/`, Maven artifact `org.jqassistant.plugin.typescript:jqassistant-typescript-plugin`): a jQAssistant scanner plugin that maps that JSON to graph nodes and relations.

Both halves implement the generic [Language Concept Extractor (LCE) architecture](https://jqassistant-plugin.github.io/jqassistant-lce-docs/). The JSON report is the only contract between them, and both halves are versioned and released together.

## Documentation map

Read the relevant page before changing an area; update it when behaviour changes.

| Topic | Where |
| --- | --- |
| Published plugin documentation (built from `docs/`) | <https://jqassistant-plugin.github.io/jqassistant-typescript-plugin> |
| Entry point of the docs, graph model overview, supported/unsupported features | [docs/index.md](docs/index.md) |
| Installation and usage | [Installation](docs/usage/Installation.md), [Basic Usage](docs/usage/Basic%20Usage.md) |
| Graph model: one page per node label | `docs/usage/Node - TS *.md`, e.g. [:TS:Module](docs/usage/Node%20-%20TS%20Module.md), [:TS:Class](docs/usage/Node%20-%20TS%20Class.md), [:TS:Type](docs/usage/Node%20-%20TS%20Type.md), [:TS:Value](docs/usage/Node%20-%20TS%20Value.md) |
| Cross-cutting graph concepts | [Fully Qualified Names](docs/usage/Node%20Properties%20-%20Fully%20Qualified%20Names.md), [Dependencies](docs/usage/Node%20Relation%20-%20Dependencies.md), [Code Coordinates](docs/usage/Node%20Properties%20-%20Code%20Coordinates.md) |
| React extension | [React Extension](docs/usage/React%20Extension.md) |
| Codebase layout | [Codebase Layout](docs/development/Codebase%20Layout.md) |
| LCE building blocks as implemented here | [Concepts](docs/development/Concepts.md), [Traversers](docs/development/Traversers.md), [Processors](docs/development/Processors.md), [Post-Processors](docs/development/Post-Processors.md), [Local Contexts](docs/development/Local%20Contexts.md), [Utilities](docs/development/Utilities.md), [Extensions](docs/development/Extensions.md) |
| Extraction strategies | [Overview](docs/development/Extraction%20Strategies.md), [Dependencies and FQNs](docs/development/Extraction%20Strategy%20-%20Dependencies.md), [Types](docs/development/Extraction%20Strategy%20-%20Types.md) |
| Testing | [Testing Strategy](docs/development/Testing%20Strategy.md) |

Generic LCE architecture (language independent, maintained in [jqassistant-lce-docs](https://github.com/jqassistant-plugin/jqassistant-lce-docs)):
[overview and process](https://jqassistant-plugin.github.io/jqassistant-lce-docs/) ·
[LCE Tool](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/LCE-Tool) ·
[Extractor API](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Extractor-API) ·
[Project](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Project) ·
[Native Tools and APIs](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Native-Tools-and-APIs) ·
[Language Concept](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Language-Concept) ·
[Concept Map](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Concept-Map) ·
[Traversers](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Traversers) ·
[Processors](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Processors) ·
[Processing Context](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Processing-Context) ·
[Global Context](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Global-Context) ·
[Local Contexts](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Local-Contexts) ·
[Execution Conditions](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Execution-Conditions) ·
[Metadata Assignment Rules](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Metadata-Assignment-Rules) ·
[Post Processors](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Post-Processors) ·
[Feature Collections](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Feature-Collections) ·
[Extensions](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/Extensions) ·
[jQAssistant Plugin](https://jqassistant-plugin.github.io/jqassistant-lce-docs/architecture/jQAssistant-Plugin)

## Repository layout

```
docs/                    documentation (Obsidian vault, published with Quartz)
  usage/                 user docs: one page per node label, FQNs, dependencies, ...
  development/           developer docs: layout, LCE components, extraction strategies, testing
  files/                 diagrams (.drawio sources and exported .jpg)
  templates/             page templates (e.g. node page)
typescript/              LCE tool (npm package @jqassistant/ts-lce)
  src/main.ts            CLI entry point, activates extensions
  src/core/              LCE framework (*.ts directly in core/) and all core language features
    concepts/ traversers/ processors/ post-processors/ utils/
  src/react/             React extension (same sub-structure as core/)
  test/                  Jest integration tests, sample projects, test utilities
java/                    jQAssistant plugin (Maven module, the only module of the root pom.xml)
  src/main/java/org/jqassistant/plugin/typescript/
    api/                 TypescriptScope, descriptor interfaces (api.model.core / api.model.react), report language
    impl/model/          POJOs mirroring the JSON report (core / react)
    impl/mapper/         MapStruct mappers and resolvers: the main logic of the plugin
    impl/filesystem/     file resolver for absolute local paths
  src/main/resources/META-INF/jqassistant-plugin.xml   plugin descriptor (lists every descriptor type)
  src/test/              integration tests, sample projects and checked-in JSON reports
.github/                 CI, release and docs workflows
```

## Build, test, run

Prerequisites: Node.js (current LTS, as used by CI) with npm, a JDK (11 or newer) and Maven.
The two halves are built independently: the LCE tool with npm only, the plugin with Maven only (`typescript/pom.xml` is not referenced by the root POM and takes no part in the build).

### LCE tool (run inside `typescript/`)

| Task | Command |
| --- | --- |
| Install dependencies | `npm ci` |
| Run all tests | `npm test` |
| Run one test file | `npx jest test/core/integration/enum-declarations.test.ts` |
| Compile and type-check (output in `dist/`) | `npm run build` |
| Run the compiled CLI | `node dist/src/main.js <path> [-e react] [-p] [-d]` (`--help` lists all options) |

- Tests must be started from `typescript/`: sample project paths are relative to it.
- Jest transpiles each file on its own (`isolatedModules`) and therefore does **not** type-check. Type errors only show up in `npm run build`, so run both. CI runs `npm test` only.
- A few sample projects need npm packages; the tests install them on first use (`initNodeSampleProject`), which needs network access and makes the first run slower.
- Dependencies are pinned to exact versions (`.npmrc`: `save-exact=true`); `npm run upgrade` bumps all of them.

### jQA plugin (run in the repository root)

| Task | Command |
| --- | --- |
| Build and run all integration tests | `mvn verify -PIT` |
| Run a single integration test | `mvn verify -PIT -Dit.test=TypescriptScannerCoreBasicsIT -Dfailsafe.failIfNoSpecifiedTests=false` |
| Build without tests | `mvn verify` |

- All Java tests are `*IT` classes bound to the `IT` profile of the inherited parent POM. A plain `mvn verify` or `mvn install` executes **no** tests.
- Sources are compiled with `--release 11` (inherited); CI builds with more than one JDK. Use only Java 11 language features and APIs.
- The inherited build also runs a jQAssistant scan and analysis of the plugin itself.

### End to end

Run the LCE on a project, then scan the report with jQAssistant using the scope `typescript:project`
(`typescript:project::<path>/.reports/jqa/ts-output.json`), see [Basic Usage](docs/usage/Basic%20Usage.md).
The versions of the LCE tool and the plugin have to match.

## Architecture

### How the LCE architecture maps to the code

| LCE building block | Implementation (`typescript/src/`) |
| --- | --- |
| Extractor API | `main.ts` (CLI), `core/extractor.ts` (`processProjects` is the programmatic entry point used by tests) |
| Project | `core/project.ts` (`LCEProjectInfo`, `LCEProject`), `core/utils/project.utils.ts` (discovery via `tsconfig.json` and its `references`) |
| Native tools | ESLint AST from `@typescript-eslint/typescript-estree`, TypeScript Compiler API (`TypeChecker`), both reachable through `GlobalContext` |
| Language concept, concept map | `core/concept.ts` (`LCEConcept`, `LCENamedConcept`, `ConceptMap` and its helpers), `core/concepts/*.concept.ts` |
| Traversers | `core/traverser.ts`, `core/traversers/*.traverser.ts`, `core/utils/traverser.utils.ts` |
| Processors, execution conditions | `core/processor.ts`, `core/execution-condition.ts`, `core/processors/*.processor.ts` |
| Processing context | `core/context.ts` (`ProcessingContext`, `GlobalContext`, `LocalContexts`, `MetadataAssignmentRule`, `FQN`), `core/context.keys.ts` |
| Post-processors | `core/post-processor.ts`, `core/post-processors/*.post-processor.ts` |
| Feature collections | `core/features.ts` (`TRAVERSERS`, `PROCESSORS`, `POST_PROCESSORS`) |
| Extensions | `react/` and its `react-extractor.ts`, activated in `main.ts` via `-e` |

### What happens for each source file

1. `extractor.ts` parses the file with `parseAndGenerateServices` and builds a `GlobalContext` (project info, file paths, AST, parser services, type checker).
2. `AstTraverser` starts a depth-first traversal. For each node the `Traverser` registered for its node type:
   1. pushes a new local context and stores the `TraverserContext` (name and index of the parent property the node was reached through),
   2. selects processors by node type and then by `executionCondition.check(...)`,
   3. calls `preChildrenProcessing` of each selected processor (sets up local contexts),
   4. delegates to its children (`traverseChildren`) and collects their concepts in a `ConceptMap`,
   5. calls `postChildrenProcessing` of each selected processor, which consumes child concepts and returns new ones,
   6. pops the local context, applies pending metadata assignment rules to the new concepts,
   7. returns the unconsumed child concepts merged with the new ones.
3. A `ConceptMap` is two-level: `parent property name → concept id → concepts`. This lets a parent processor tell apart concepts of the same type coming from different children (for example `extends` and `implements`).
4. Everything that reaches the top of a file is collected per project by concept id. After all projects are processed, the post-processors run on the projects (external modules, export resolution, React components), then the result is serialized.

### Design rules

These are the ideas the code is built around. Keep to them when extending it.

- **One traversal per file.** All concepts are extracted during the single AST traversal. Do not start additional sub-tree traversals.
- **ESLint AST first, Compiler API second.** Use the ESLint AST for structure. Use the TypeScript `TypeChecker` for type information only, through the functions in `processors/type.utils.ts`. Map between both ASTs with `globalContext.services`.
- **Traversers only navigate.** A traverser decides which children are visited and under which property name. It contains no extraction logic. Property names are `public static readonly ..._PROP` constants on the traverser class and are used by processors to pick up child concepts.
- **Do not skip AST levels.** Delegate to direct child nodes only. Reaching through a node (for example `node.body.body`) leaves `parent` wrong on the visited nodes. The few existing shortcuts are marked with TODOs; do not add more.
- **Node types without a traverser are ignored, including their whole subtree.** `runTraverserForNode` returns silently if `TRAVERSERS` has no entry. When adding support for a syntax construct, first check that every traverser on the path visits the required children. Use `SimpleTraverser` for leaf nodes.
- **Processors know as little as possible about their parents.** Information flows down through local contexts (keys in `CoreContextKeys` / `ReactContextKeys`) and up through returned concepts. Typical patterns are processing flags set by a parent processor (`VALUE_PROCESSING_FLAG`, `PROCESS_CLASS_LIKE_MEMBERS`, ...) that child processors test in their execution condition.
- **Consume what you use.** A processor that composes a concept from child concepts removes them from the map (`getAndDeleteChildConcepts`, `getAndDeleteAllValueChildConcepts`). Whatever is left bubbles up and ends in the report.
- **Concept classes are plain data.** No processing logic, and `toJSON` exports all fields except `metadata`. Property names are the JSON keys the Java POJOs expect.
- **Post-processors see concepts only.** They work across files and projects and have no AST access. Information needed later is attached as `metadata` via a `MetadataAssignmentRule`.
- **Extensions only add to the feature collections.** Optional technology support lives in its own directory, mirrors the `core/` structure and is registered by an init function. Core code does not depend on extensions.
- **Normalize paths.** Convert every externally obtained path with `FileUtils.normalizePath` (forward slashes). Tests run on Linux, Windows and macOS.

### FQNs and dependencies

Details: [Extraction Strategy - Dependencies](docs/development/Extraction%20Strategy%20-%20Dependencies.md) and [Fully Qualified Names](docs/usage/Node%20Properties%20-%20Fully%20Qualified%20Names.md).

- Every named concept carries an `FQN` with a `globalFqn` (absolute module path, unique across projects, used for all linking) and a `localFqn` (relative to the project root). Format: `"<module path>".<declaration>.<member>`; `index.*` modules use the directory path; default exports use the identifier `default`; external declarations use `"<package name>".<declaration>`.
- `DependencyResolutionProcessor` runs on the `Program` node. It owns the declaration index, the FQN scope stack, the list of scheduled FQN resolutions and the dependency index, and offers static helpers for all of them.
- A declaration processor follows this protocol:
  - in `preChildrenProcessing`: `addScopeContext(...)` and `createDependencyIndex(...)`,
  - in `postChildrenProcessing`: `constructScopeFQN(...)`, `registerDeclaration(...)`, optionally `scheduleFqnResolution(...)`, and return the new concept **merged with** `getRegisteredDependencies(localContexts)`. Without that merge the dependencies of the declaration are lost.
- Referenced identifiers are registered as dependencies while traversing (`IdentifierDependencyProcessor`, `MemberExpressionDependencyProcessor`, and the type parsing in `type.utils.ts`). FQNs that cannot be resolved immediately are resolved at the end of the file.
- The LCE emits direct dependencies only. The jQA plugin creates `DEPENDS_ON` relations from them and adds the propagated and aggregated ones with Cypher (`DependencyResolver`).

### jQA plugin

`TypescriptProjectScannerPlugin` accepts `.json` files in the scope `typescript:project` and processes them in three layers:

1. **POJOs** (`impl.model`): Jackson deserializes the report into Lombok data classes. `ConceptCollection` has one list per top-level concept id (`@JsonAlias`). Type and value variants are polymorphic (`@JsonTypeInfo` on `Type` / `Value`, discriminated by the `type` / `valueType` property).
2. **Mappers and resolvers** (`impl.mapper`): MapStruct mappers (`DescriptorMapper<POJO, Descriptor>`, the scanner is passed as `@Context`) create the descriptors. Cross references are handled by helper objects pushed onto the scanner context (`FqnResolver` registers every global FQN and resolves type/value references at the end, `TypeParameterResolver` keeps scoped type parameters) and by resolver steps that run after the mapping (`DependencyResolver`, `ExportDeclarationResolver` and, for React, `ReactComponentResolver`).
3. **Descriptors** (`api.model`): XO interfaces defining labels and relations (`@Label`, `@Relation`). All nodes carry the base label `:TS` through `TypeScriptDescriptor`. Every descriptor type must be listed in `META-INF/jqassistant-plugin.xml`.

Packages are split into `core` and one sub-package per extension (`react`).

## Development patterns

### Naming and file conventions

| Kind | File | Class |
| --- | --- | --- |
| Concept | `concepts/<name>.concept.ts` | `LCE<Name>`, with a unique `public static override conceptId = "kebab-case"`; type variants `LCEType<Kind>` (`typeId`), value variants `LCEValue<Kind>` (`valueTypeId`) |
| Traverser | `traversers/<name>.traverser.ts` | `<NodeType>Traverser extends Traverser`, registered in `TRAVERSERS` |
| Processor | `processors/<name>.processor.ts` | `<Name>Processor extends Processor`, registered in `PROCESSORS` |
| Post-processor | `post-processors/<name>.post-processor.ts` | `<Name>PostProcessor extends PostProcessor`, registered in `POST_PROCESSORS` |
| Utilities | `utils/<name>.utils.ts`, `processors/*.utils.ts` | static utility classes or exported functions |
| Local context keys | `context.keys.ts` of core or the extension | `CoreContextKeys`, `ReactContextKeys` |
| Java descriptor | `api/model/<core or react>/<Name>Descriptor.java` | interface, relation descriptors for relations with properties |
| Java POJO | `impl/model/<core or react>/<Name>.java` | Lombok `@Getter @Setter @ToString` |
| Java mapper | `impl/mapper/<core or react>/<Name>Mapper.java` or `<Name>Resolver.java` | MapStruct interface with `INSTANCE`, or a plain resolver class |

A file may export several related classes (for example all traversers for expressions, or all value processors).

### Adding or changing a language concept

A change to the report format always touches both halves. Work through all of these:

1. **Concept**: add or change the class in `concepts/`; use `CodeCoordinates` for source locations and `FQN` for names.
2. **Traversal**: make sure the needed nodes are reached; add traversers or extend `traverseChildren` of existing ones, register new ones in `features.ts`.
3. **Processor**: implement the execution condition as narrowly as possible, set up contexts in `preChildrenProcessing`, build the concept in `postChildrenProcessing`, register it in `features.ts`. Reuse `processor.utils.ts`, `type.utils.ts` and `CodeCoordinateUtils`.
4. **LCE test**: add or extend a sample project and a test in `typescript/test/`.
5. **POJO**: mirror the JSON in `impl.model`; add a list to `ConceptCollection` for a new top-level concept id, or a `@JsonSubTypes` entry for a new type/value variant. Unknown JSON properties are ignored on the Java side, so a missing field does not fail, it is silently dropped.
6. **Descriptor**: add or change the interface in `api.model` and register new types in `jqassistant-plugin.xml`.
7. **Mapper**: map POJO to descriptor, add the mapper to the `uses` list of its parent mapper, register global FQNs with `FqnResolver`. Add a `TypeScript` language element in `api.report` if the node has code coordinates.
8. **Java test data**: regenerate the checked-in reports and extend the IT assertions, see [Adding or changing Java integration tests](#adding-or-changing-java-integration-tests).
9. **Docs**: add or update the node page (`docs/templates/Template - Node.md`), link it from `docs/index.md` or its parent page, and update the model diagram in `docs/files/` if the structure changed.

### Adding or changing Java integration tests

Each IT class scans one checked-in report, generated from one sample project in `java/src/test/resources/`:

| IT class | Sample project | Checked-in report |
| --- | --- | --- |
| `TypescriptScannerCoreBasicsIT` | `java-it-core-basics-sample-project/` | `java-it-core-basics-sample-ts-output.json` |
| `TypescriptScannerCoreMultiProjectIT` | `java-it-core-multi-sample-projects/` | `java-it-core-multi-sample-ts-output.json` |
| `TypescriptScannerReactIT` | `java-it-react-sample-project/` | `java-it-react-sample-ts-output.json` |

The reports are generated, never edited by hand. Regenerate them with `regenerate-test-data.sh` (prerequisites under [Testing conventions](#testing-conventions)) after

- any change to a `java-it-*` sample project, and
- any change to the LCE tool that may change its output. This is not limited to report format changes: bug fixes and changes to the extraction of existing concepts, FQNs, dependencies or code coordinates count as well. Without regeneration the ITs keep scanning an outdated report and pass without testing the current LCE.

Steps:

1. Add or change the TypeScript code in the sample project (skip this for an LCE-only change).
2. Run `./regenerate-test-data.sh` from within `java/src/test/resources/`. It always regenerates all three reports.
3. Review the diff of the reports: it should contain only the expected changes, also in the reports of the other ITs, and no absolute paths of your machine.
4. Add or adjust the assertions in the IT class or its `assertions` package. Build paths with `TestUtils.resolvePath`, never hard-code them.
5. Run `mvn verify -PIT`.
6. Commit the sample project, the regenerated reports and the IT changes together.

Regeneration is not automated: no Git hook runs it and CI does not detect an outdated report, so do it by hand.

### Adding an extension

Follow [Extensions](docs/development/Extensions.md): a new directory under `typescript/src/` with its own `concepts/`, `processors/`, ... and `context.keys.ts`, an `<name>-extractor.ts` init function that pushes into the feature collections, activation in `main.ts`, and matching `<name>` sub-packages plus `ConceptCollection` entries on the Java side.

### Code style

- TypeScript: `strict` and `noImplicitOverride` (use `override`), CommonJS output, relative imports without file extension, 4 spaces, 150 columns (`typescript/.prettierrc.json`). Prefer narrowing by `node.type === AST_NODE_TYPES.X` over casts.
- Many existing files are not Prettier-formatted and there is no lint or format script. Format the code you write, and do not reformat code you are not changing.
- Java: 4 spaces, LF, UTF-8 (`.editorconfig`); Lombok for POJOs, MapStruct for mapping, SLF4J for logging.
- Log through `debug(...)` from `utils/log.utils.ts` for diagnostics that should only appear with `--debug`.

## Testing conventions

- **LCE**: integration tests only. Each `test/<core|react>/integration/<topic>.test.ts` runs `processProjects(...)` on `sample-projects/<topic>/` (a real project with `tsconfig.json`) once in `beforeAll`, indexes the returned concepts by local FQN and asserts on concept objects. Use the helpers in `test/utils/test-utils.ts` (`expectDependency`, `expectDeclaredType`, `resolveGlobalFqn`, ...). Assert on direct dependencies only; propagation happens in the plugin.
- **jQA plugin**: `*IT` classes extend `AbstractPluginIT`, scan a checked-in report from `java/src/test/resources/java-it-*-ts-output.json` and assert on the graph through descriptor getters or Cypher. Reusable fluent assertions live in the `assertions` packages. `TestUtils.getReportJson` turns the cropped paths of the checked-in reports into absolute paths for the current machine.
- **Regenerating the checked-in reports**: after any change to the `java-it-*` sample projects and after any LCE change that may change its output, run `./regenerate-test-data.sh` from within `java/src/test/resources/` (workflow in [Adding or changing Java integration tests](#adding-or-changing-java-integration-tests)). It runs the LCE from source (via `ts-node`, with `-p -e react`) on the three `java-it-*` sample projects and strips the repository root from all paths. Beforehand it needs `npm ci` in `typescript/` and in `java/src/test/resources/java-it-react-sample-project/` (the React type definitions; without them the React report silently loses its components). It also needs GNU `sed`.
- There is no automated end-to-end test from TypeScript source to graph, and CI does not check that the checked-in reports are up to date. An LCE change is only covered by the ITs if the reports are regenerated and the ITs are extended.

## Pitfalls

- `core/features.ts` and the traverser/processor modules import each other. The module graph only loads correctly when `features.ts` is reached first, which is the case through `core/extractor.ts`. A new entry point or a test that imports a traverser or processor module before that fails at load time with `... is not a constructor`.
- `globalFqn` values and all paths in the report are absolute paths of the machine the LCE ran on. Never hard-code them in tests; use `resolveGlobalFqn` (TypeScript) or `TestUtils.resolvePath` (Java).
- Only module-level declarations become declaration concepts. Declarations nested in functions or blocks are not extracted; identifiers referenced inside them count as dependencies of the enclosing module-level declaration.
- The tool targets projects using ECMAScript modules. CommonJS syntax and triple-slash directives are not supported (see [docs/index.md](docs/index.md)).
- Static caches in `ModulePathUtils` and `NodeUtils` live for the whole process. Keep that in mind when calling `processProjects` more than once in one process.

## CI, releases, versions

- `.github/workflows/ci.ts.yml`: `npm ci` and `npm test` on Linux, Windows and macOS.
- `.github/workflows/ci.java.yml`: shared jQAssistant workflow, builds with the `IT` profile.
- `.github/workflows/release.yml` (manual): Maven release, then `npm run build` and `npm publish` from `typescript/`, then a versioned docs deployment. The version lives in the root `pom.xml` / `java/pom.xml` and in `typescript/package.json`; the workflow sets both.
- `.github/workflows/publish-docs.yml`: publishes `docs/` on pushes to `main`.
- Release notes are drafted from pull requests. Branch prefixes set the label: `feature/`, `bug/` (also `bugfix/`, `hotfix/`), `chore/`.
- Dependabot opens weekly update pull requests for Maven and npm.

## Documentation conventions

- `docs/` is an Obsidian vault: pages link to each other with `[[Page Name]]` / `[[Page Name|label]]` and declare `aliases` in the front matter. Links to the generic LCE architecture use the published URLs.
- Pages are written as short bullet lists starting with a `->` one-line summary; node pages have `Properties` and `Relations` tables. Keep that style.
- Diagrams are maintained as `.drawio` files in `docs/files/` and committed together with their exported image.
