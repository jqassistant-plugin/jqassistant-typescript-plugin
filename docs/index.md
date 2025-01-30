---
title: jQAssistant TypeScript Plugin
---
# jQAssistant TypeScript Plugin

This is the TypeScript plugin for [jQAssistant](https://jqassistant.org).
## Usage
- [[Installation]]
- [[Basic Usage]]

**Core Graph Structure:**
-> the core model represents all basic TypeScript language concepts, independent of any used frameworks or libraries
![[jqa-ts-plugin-model-core.jpg]]
- Project Nodes:
	- [[Node - TS Project|:TS:Project]]
	- [[Node - TS Module|:TS:Module]]
	- [[Node - TS ExternalModule|:TS:ExternalModule]] and [[Node - TS ExternalDeclaration|:TS:ExternalDeclaration]]
- Declaration Nodes:
	- [[Node - TS TypeAlias|:TS:TypeAlias]]
	- [[Node - TS Class|:TS:Class]]
	- [[Node - TS Interface|:TS:Interface]]
	- [[Node - TS Enum|:TS:Enum]]
	- [[Node - TS Function|:TS:Function]]
	- [[Node - TS Variable|:TS:Variable]]
- Type Nodes: [[Node - TS Type|:TS:Type]]
- Value Nodes: [[Node - TS Value|:TS:Value]]
- Auxiliary Concepts and Patterns:
	- [[Node Properties - Fully Qualified Names|Fully Qualified Names (FQNs)]]
	- [[Node Relation - Dependencies|Dependencies]]
	- [[Node Properties - Code Coordinates|Code Coordinates]]

**Extensions:**
- [[React Extension]]

## Support  
This plugin should be largely compatible with all versions of TypeScript.  
However, it is only developed and tested against the current version (5.x) of TypeScript.  
  
The tool currently only supports projects using ECMAScript modules.  
  
**Currently not supported:**  
- old CommonJS module syntax  
- triple-slash directives

## Development
This plugin is based on the [LCE Architecture](https://jqassistant-plugin.github.io/jqassistant-lce-docs/).
- [[Codebase Layout]]
- [[Extensions]]
- *TODO: Testing Strategy*

**Base LCE Architecture Implementation:**
- [[Concepts]]
- [[Traversers]]
- [[Processors]]
- [[Post-Processors]]
- [[Local Contexts]]
- [[Utilities]]

**Extraction Strategies:**
- *[[Extraction Strategies|Overview]]*
- [[Extraction Strategy - Dependencies|Dependencies and FQNs]]