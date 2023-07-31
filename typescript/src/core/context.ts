import {ParserServices} from "@typescript-eslint/parser";
import {Node} from "@typescript-eslint/types/dist/generated/ast-spec";
import {AST} from "@typescript-eslint/typescript-estree";
import {TypeChecker} from "typescript";

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
        public services: ParserServices,
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

export interface ProcessingContext {
    node: Node;
    globalContext: GlobalContext;
    localContexts: LocalContexts;
}
