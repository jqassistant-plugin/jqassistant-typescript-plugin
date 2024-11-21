# Installation

## 1. jQA CLI Installation
- Download the ZIP-distribution of the jQAssistant command line utility ([Neo4j 4](https://central.sonatype.com/artifact/com.buschmais.jqassistant.cli/jqassistant-commandline-neo4jv4/versions) or [Neo4j 5](https://central.sonatype.com/artifact/com.buschmais.jqassistant.cli/jqassistant-commandline-neo4jv5/versions)) and unpack it

## 2. npm LCE Tool Installation
**Global Installation:**
- run `npm install --global  @jqassistant/ts-lce`  
  
**Local Installation:**
- Run `npm install --save-dev  @jqassistant/ts-lce`  
- Add the following section to the `package.json` (add additional options as needed)  
	```json
	"scripts": {  
	    "jqa": "jqa-ts-lce"  
	}
	```

## 3. Project Setup
- create a `.jqassistant.yml` file in the directory that contains your project(s)
	```yaml
	jqassistant:
	  plugins:
	    - group-id: org.jqassistant.plugin.typescript
	      artifact-id: jqassistant-typescript-plugin
	      version: 1.2.0
	  scan:
	    include:
	      files:
		    - typescript:project::build/jqa-ts-output.json
	```
	- for the most recent versions of the plugin see the [Maven](https://central.sonatype.com/artifact/org.jqassistant.plugin.typescript/jqassistant-typescript-plugin/versions)

> [!NOTE]
> From version `1.2.0` onward, the version of the `@jqassistant/ts-lce` Node package and the version of the jQA plugin have to match to avoid incompatibility issues.

- to exclude unwanted scans of directories like `node_modules` you can exclude them in the `jqassistant.yml`:
	```yaml
	jqassistant:
	  scan:
		properties:
		  file.exclude:
			- /node_modules/**
			- /dist/**
			- /jqassistant/**
	```

> see [[Basic Usage]] for more details on how to run the tool