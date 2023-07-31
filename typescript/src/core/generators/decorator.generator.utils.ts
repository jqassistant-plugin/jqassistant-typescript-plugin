import {Integer, Session} from "neo4j-driver";

import {LCEDecorator} from "../concepts/decorator.concept";
import {ConnectionIndex, ConnectionProperties} from "../connection-index";
import {createValueNode} from "./value.generator.utils";

export async function createDecoratorNode(
    deco: LCEDecorator,
    neo4jSession: Session,
    connectionIndex: ConnectionIndex,
    parentNode: Integer,
    connectionProps: ConnectionProperties
): Promise<void> {
    await createValueNode(deco.value, neo4jSession, connectionIndex, parentNode, connectionProps);
}
