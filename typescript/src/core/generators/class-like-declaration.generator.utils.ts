import {Integer, Session} from "neo4j-driver";

import {LCEClassDeclaration} from "../concepts/class-declaration.concept";
import {LCEInterfaceDeclaration} from "../concepts/interface-declaration.concept";
import {LCETypeAliasDeclaration} from "../concepts/type-alias-declaration.concept";
import {ConnectionIndex} from "../connection-index";
import {createConstructorNode, createGetterNode, createMethodNode, createSetterNode} from "./method.generator.utils";
import {createPropertyNode} from "./property.generator.utils";
import {createTypeParameterNodes} from "./type.generator.utils";

export async function createClassLikeTypeParameterNodes(
    decl: LCEClassDeclaration | LCEInterfaceDeclaration | LCETypeAliasDeclaration,
    declNodeId: Integer,
    neo4jSession: Session,
    connectionIndex: ConnectionIndex
): Promise<Map<string, Integer>> {
    // create type parameter structures and connections
    const classLikeTypeParameters: Map<string, Integer> = await createTypeParameterNodes(decl.typeParameters, neo4jSession, connectionIndex);
    for (const typeParamNodeId of classLikeTypeParameters.values()) {
        connectionIndex.connectionsToCreate.push([declNodeId, typeParamNodeId, {name: ":DECLARES", props: {}}]);
    }
    return classLikeTypeParameters;
}

export async function createMemberNodes(
    decl: LCEClassDeclaration | LCEInterfaceDeclaration,
    declNodeId: Integer,
    classLikeTypeParameters: Map<string, Integer>,
    neo4jSession: Session,
    connectionIndex: ConnectionIndex
) {
    // create property structures and connections
    for (const propertyDecl of decl.properties) {
        const propNodeId = await createPropertyNode(propertyDecl, neo4jSession, connectionIndex, classLikeTypeParameters);
        connectionIndex.connectionsToCreate.push([declNodeId, propNodeId, {name: ":DECLARES", props: {}}]);
    }

    // create method, constructor, getter and setter structures and connections
    for (const methodDecl of decl.methods) {
        const methodNodeId = await createMethodNode(methodDecl, neo4jSession, connectionIndex, classLikeTypeParameters);
        connectionIndex.connectionsToCreate.push([declNodeId, methodNodeId, {name: ":DECLARES", props: {}}]);
    }
    if ("constr" in decl && decl.constr) {
        const constructorNodeId = await createConstructorNode(decl.constr, neo4jSession, connectionIndex, classLikeTypeParameters, declNodeId);
        connectionIndex.connectionsToCreate.push([declNodeId, constructorNodeId, {name: ":DECLARES", props: {}}]);
    }
    for (const getterDecl of decl.getters) {
        const getterNodeId = await createGetterNode(getterDecl, neo4jSession, connectionIndex, classLikeTypeParameters);
        connectionIndex.connectionsToCreate.push([declNodeId, getterNodeId, {name: ":DECLARES", props: {}}]);
    }
    for (const setterDecl of decl.setters) {
        const setterNodeId = await createSetterNode(setterDecl, neo4jSession, connectionIndex, classLikeTypeParameters);
        connectionIndex.connectionsToCreate.push([declNodeId, setterNodeId, {name: ":DECLARES", props: {}}]);
    }
}
