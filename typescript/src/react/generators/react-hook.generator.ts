import {Session} from "neo4j-driver";
import {getAndCastConcepts, LCEConcept} from "../../core/concept";
import {ConnectionIndex} from "../../core/connection-index";
import {Generator} from "../../core/generator";
import {Utils} from "../../core/utils";
import {LCEReactStateHook} from "../concepts/react-hook.concept";

/**
 * Generates all graph structures related to React Hooks.
 */
export class ReactHookGenerator extends Generator {
    async run(neo4jSession: Session, concepts: Map<string, LCEConcept[]>, connectionIndex: ConnectionIndex): Promise<void> {
        // create state hook structures
        const stateHooks = getAndCastConcepts<LCEReactStateHook>(LCEReactStateHook.conceptId, concepts);

        console.log("Generating graph structures for hook usages...");

        let stateHookCount = 0;
        for (const stateHook of stateHooks) {
            const componentNodeIds = Utils.getNodeIdsFromQueryResult(
                await neo4jSession.run(
                    `
                MATCH (comp:TS:React {fqn: $fqn}) 
                RETURN id(comp)
                `,
                    { fqn: stateHook.componentFqn }
                )
            );

            if (componentNodeIds.length === 1) {
                // create state hook node
                const hookNodeProps = {
                    propertyName: stateHook.propName,
                    setterName: stateHook.setterName,
                };
                const hookNodeId = Utils.getNodeIdFromQueryResult(
                    await neo4jSession.run(
                        `
                    CREATE (hook:TS:React:StateHook $hookNodeProps) 
                    RETURN id(hook)
                    `,
                        { hookNodeProps }
                    )
                );
                connectionIndex.connectionsToCreate.push([componentNodeIds[0], hookNodeId, { name: ":USES", props: {} }]);
                stateHookCount++;
            }
        }
        console.log("Generated " + stateHookCount + " state hook usages.");
    }
}
