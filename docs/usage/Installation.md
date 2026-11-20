# Installation

## Requirements
- Node.js `22.12.0` or newer
- jQAssistant `2.10` or newer (plugin versions up to `1.4.x` need jQAssistant `2.9` or older)

> [!NOTE]
> From version `1.2.0` onward, the version of the `@jqassistant/ts-lce` Node package and the version of the jQA plugin have to match to avoid incompatibility issues.

## 1. jQA CLI Installation
- Download the ZIP-distribution of the jQAssistant command line utility ([Neo4j 4](https://central.sonatype.com/artifact/com.buschmais.jqassistant.cli/jqassistant-commandline-neo4jv4/versions) or [Neo4j 5](https://central.sonatype.com/artifact/com.buschmais.jqassistant.cli/jqassistant-commandline-neo4jv5/versions)) and unpack it

## 2. npm LCE Tool Installation

**Global Installation:**
- run `npm install --global @jqassistant/ts-lce`

**Local Installation:**
- run `npm install --save-dev @jqassistant/ts-lce`
- add the following section to the `package.json` (add additional options as needed):

```json
"scripts": {
    "jqa": "jqa-ts-lce"
}
```

## 3. Project Setup
- create a `.jqassistant.yml` file in the directory that contains your project(s):

```yaml
jqassistant:
  plugins:
    - group-id: org.jqassistant.plugin.typescript
      artifact-id: jqassistant-typescript-plugin
      version: <version>
  scan:
    include:
      files:
        - typescript:project::.reports/jqa/ts-output.json
    properties:
      file.exclude:
        - /node_modules/**
        - /dist/**
        - /jqassistant/**
```

- replace `<version>` with the version of the installed `@jqassistant/ts-lce` package (`jqa-ts-lce --version`, or `npx jqa-ts-lce --version` for a local installation), for the available versions of the plugin see [Maven Central](https://central.sonatype.com/artifact/org.jqassistant.plugin.typescript/jqassistant-typescript-plugin/versions)
- `file.exclude` only takes effect if you also scan directories (e.g. by adding `.` to `files`): it keeps the files in `node_modules`, `dist` and `jqassistant` out of that scan

> see [[Basic Usage]] for more details on how to run the tool
