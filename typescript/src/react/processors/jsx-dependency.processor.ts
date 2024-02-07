import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import { ConceptMap } from "../../core/concept";
import { FQN, MetadataAssignmentRule, ProcessingContext } from "../../core/context";
import { ExecutionCondition } from "../../core/execution-condition";
import { Processor } from "../../core/processor";
import { LCEJSXDependency } from "../concepts/react-jsx-dependency";
import { DependencyResolutionProcessor } from "../../core/processors/dependency-resolution.processor";
import { LCEClassDeclaration } from "../../core/concepts/class-declaration.concept";
import { LCEVariableDeclaration } from "../../core/concepts/variable-declaration.concept";
import { LCEFunctionDeclaration } from "../../core/concepts/function-declaration.concept";
import { VariableDeclarationProcessor } from "../../core/processors/variable-declaration.processor";

export class JSXDependencyContextProcessor extends Processor {
    /**
     * represents a list of JSX tags that is used in some environment, e.g. inside the code of a function
     */
    public static readonly JSX_DEPENDENCY_CONTEXT = "jsx-dependency-context";

    public static readonly JSX_DEPENDENCY_METADATA: "jsx-dependencies";

    public executionCondition: ExecutionCondition = new ExecutionCondition(
        [
            AST_NODE_TYPES.VariableDeclarator,
            AST_NODE_TYPES.FunctionDeclaration,
            AST_NODE_TYPES.ArrowFunctionExpression,
            AST_NODE_TYPES.ClassDeclaration,
        ],
        ({ localContexts, node }) =>
            !!localContexts.parentContexts?.get(VariableDeclarationProcessor.VARIABLE_DECLARATION_KIND_CONTEXT) ||
            (!!node.parent &&
                (node.parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
                    node.parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
                    node.parent.type === AST_NODE_TYPES.Program)),
    );

    public override preChildrenProcessing(processingContext: ProcessingContext) {
        processingContext.localContexts.currentContexts.set(JSXDependencyContextProcessor.JSX_DEPENDENCY_CONTEXT, new Array<LCEJSXDependency>());
    }

    public override postChildrenProcessing({ localContexts, metadataAssignments }: ProcessingContext): ConceptMap {
        const jsxContext: LCEJSXDependency[] = (
            localContexts.getNextContext(JSXDependencyContextProcessor.JSX_DEPENDENCY_CONTEXT) as [LCEJSXDependency[], number]
        )[0];

        const aggregatedDependencies = new Map<string, LCEJSXDependency>();
        for (const dep of jsxContext) {
            if (aggregatedDependencies.has(dep.fqn.globalFqn)) {
                aggregatedDependencies.get(dep.fqn.globalFqn)!.cardinality++;
            } else {
                aggregatedDependencies.set(dep.fqn.globalFqn, dep);
            }
        }

        metadataAssignments.push(
            new MetadataAssignmentRule(
                (c) => {
                    return c instanceof LCEClassDeclaration || c instanceof LCEVariableDeclaration || c instanceof LCEFunctionDeclaration;
                },
                new Map([[JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA, [...aggregatedDependencies.values()]]]),
            ),
        );

        return new Map();
    }
}

export class JSXDependencyProcessor extends Processor {
    public executionCondition: ExecutionCondition = new ExecutionCondition([AST_NODE_TYPES.JSXOpeningElement], () => true);

    public override postChildrenProcessing({ node, localContexts, globalContext }: ProcessingContext): ConceptMap {
        if (node.type === AST_NODE_TYPES.JSXOpeningElement) {
            let name = "";

            // try to determine name of the tag, abort processing, if not possible
            if(node.name.type === AST_NODE_TYPES.JSXIdentifier) {
                name = node.name.name;
            } else if (node.name.type === AST_NODE_TYPES.JSXMemberExpression) {
                let depth = 0;
                name = node.name.property.name;
                let currentExpression = node.name.object;
                while(currentExpression.type === AST_NODE_TYPES.JSXMemberExpression) {
                    if(depth > 20) {
                        console.log("ERROR: Could not resolve JSX member expression:")
                        console.log(name);
                        return new Map();
                    }
                    name = currentExpression.property.name + "." + name;
                    currentExpression = currentExpression.object;
                    depth++;
                }
                if(currentExpression.type === AST_NODE_TYPES.JSXIdentifier) {
                    name = currentExpression.name + "." + name;
                } else {
                    name = currentExpression.namespace.name + "." + name;
                }
            } else {
                return new Map();
            }

            const dep = new LCEJSXDependency(new FQN(name), name, 1);
            if(!STANDARD_HTML_ELEMENTS.includes(name)) {
                // Custom Element: try to resolve reference and register dependency
                DependencyResolutionProcessor.scheduleFqnResolution(localContexts, name, dep);
                DependencyResolutionProcessor.registerDependency(localContexts, name);
            }

            const jsxDependencyContext = (localContexts.getNextContext(JSXDependencyContextProcessor.JSX_DEPENDENCY_CONTEXT) as [LCEJSXDependency[], number]);
            if(jsxDependencyContext) {
                jsxDependencyContext[0].push(dep);
            }

        }
        return new Map();
    }
}

const STANDARD_HTML_ELEMENTS = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "math",
    "menu",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "search",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "svg",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
];
