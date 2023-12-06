import { ParserServicesWithTypeInformation } from "@typescript-eslint/parser";
import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST } from "@typescript-eslint/typescript-estree";
import { TypeChecker } from "typescript";
import { LCEConcept } from "./concept";

/**
 * describes basic data structures provided to all Processors on a file level
 */
export class GlobalContext {
    constructor(
        public projectRootPath: string,
        public sourceFilePath: string,
        public ast: AST<{
            filePath: string;
            loc: true;
            project: string;
            tsconfigRootDir: string;
            range: true;
        }>,
        public services: ParserServicesWithTypeInformation,
        public typeChecker: TypeChecker
    ) {
    }
}

/**
 * represents the local contexts currently available at a given node inside the AST
 */
export class LocalContexts {
    public contexts: Map<string, unknown>[] = [];

    get currentContexts(): Map<string, unknown> {
        if (this.contexts.length === 0) {
            return new Map();
        } else {
            return this.contexts[this.contexts.length - 1];
        }
    }

    get parentContexts(): Map<string, unknown> | undefined {
        if (this.contexts.length < 2) {
            return undefined;
        } else {
            return this.contexts[this.contexts.length - 2];
        }
    }

    /**
     * @param name name of the context type to searched for
     * @returns closest context with given name to the current contexts, along with its position inside the stack, or
     * `undefined` if no context with the given name exists
     */
    getNextContext(name: string): [unknown, number] | undefined {
        for (let i = this.contexts.length - 1; i >= 0; i--) {
            const context = this.contexts[i].get(name);
            if (context) return [context, i - this.contexts.length];
        }
        return undefined;
    }

    pushContexts(): void {
        this.contexts.push(new Map());
    }

    popContexts(): Map<string, unknown> | undefined {
        return this.contexts.pop();
    }
}

/**
 * Represents a rule for attaching certain metadata to concepts created during the post-children-processing phase.
 * The condition has to resolve to true in order for the metadata to be attached to a concept.
 *
 * A rule is propagated up the AST until it can be applied to at least one concept after the post-children-processing phase.
 */
export class MetadataAssignmentRule {
    constructor(public condition: (concept: LCEConcept) => boolean,
                public metadata: Map<string, any>) {
    }

    /**
     * Checks if the condition is met for a given concept and if it is, applies the specified metadata to it.
     *
     * @param concept Concept to which the metadata should be attached to
     * @return whether the metadata was applied
     */
    public apply(concept: LCEConcept): boolean {
        const result = this.condition(concept);
        if(result) {
            this.metadata.forEach((value, key) => {
                concept.metadata.set(key, value);
            })
        }
        return result;
    }
}

export interface ProcessingContext {
    node: Node;
    globalContext: GlobalContext;
    localContexts: LocalContexts;
    metadataAssignments: MetadataAssignmentRule[];
}
