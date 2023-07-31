import {Integer} from "neo4j-driver";

export class ConnectionIndex {
    /**
     * Used for registering connection to be made between nodes.
     * Used when both nodes of a connection are known.
     *
     * Pattern: `[from, to, connectionProperties]`
     * */
    public connectionsToCreate: [Integer, Integer, ConnectionProperties][] = [];

    /**
     * Used for registering nodes that can be conncected to via a FQN
     */
    public providerNodes: Map<string, Integer> = new Map();

    /**
     * Used for registering a connection to be made between nodes.
     * Used when only from-node of a connection is known.
     *
     * Value is FQN of target and potential properties of connection.
     */
    public referenceNodes: Map<Integer, [string, ConnectionProperties]> = new Map();

    /**
     * Resolves all connections that were not created yet and adds the to `connectionsToCreate`
     */
    public resolve(): void {
        this.resolveReferencedNodes();
    }

    /**
     * Resolves all entries in `referenceNodes`, where a provider node can be found.
     * Adds resolved connections to `connectionsToCreate` and removes them from `referenceNodes`
     */
    private resolveReferencedNodes(): void {
        console.log(" - Resolving referenced nodes...");
        for (const [from, [fqn, props]] of this.referenceNodes.entries()) {
            const provider = this.providerNodes.get(fqn);
            if (provider) {
                this.connectionsToCreate.push([from, provider, props]);
                this.referenceNodes.delete(from);
            }
        }
        console.log(" - Resolved references. (unresolved: " + this.referenceNodes.size + ")");
        // Log (non-anonymous) unresolved references
        // for (const node of this.referenceNodes) {
        //     if (!node[1][0].startsWith("(")) {
        //         console.log("Unresolved reference: " + node[1][0]);
        //     }
        // }
    }
}

export interface ConnectionProperties {
    name: string;
    props: object;
}
