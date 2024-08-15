import { ParserServicesWithTypeInformation } from "@typescript-eslint/parser";
import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST } from "@typescript-eslint/typescript-estree";
import { TypeChecker } from "typescript";
import { LCEConcept } from "./concept";
import { LCEProjectInfo } from "./project";


/**
 * Represents a fully qualified name.
 * An object can be identified by a global fully qualified name which is unique, even across projects, but may be hard-to-read by humans.
 * The local fully qualified name provides an alternative to this, however, it is only unique within a project (it may be left empty for concepts that use the FQN only for linking nodes).
 */
export class FQN {
    constructor(public globalFqn: string,
                public localFqn: string = "") {
    }

    /**
     * Returns a new FQN instance using the provided identifier for both global and local FQNs.
     */
    public static id(identifier: string): FQN {
        return new FQN(identifier, identifier);
    }
}

/**
 * describes basic data structures provided to all Processors on a file level
 */
export class GlobalContext {
    constructor(
        public projectInfo: LCEProjectInfo,
        public sourceFilePathAbsolute: string,
        public sourceFilePathRelative: string,
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
     * @returns closest context with given name to the current contexts, along with its position inside the stack (0 being the current context), or
     * `undefined` if no context with the given name exists
     */
    getNextContext(name: string): [unknown, number] | undefined {
        for (let i = this.contexts.length - 1; i >= 0; i--) {
            const context = this.contexts[i].get(name);
            if (context) return [context, this.contexts.length - i - 1];
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

