import { Driver, Session } from "neo4j-driver";
import path from "path";

import { processProject } from "../../../src/core/extractor";
import { prepareDB, setupNeo4j, teardownNeo4j } from "../../utils/test-utils";

jest.setTimeout(30000);

describe("core integration test", () => {
    let driver: Driver, session: Session;

    beforeAll(async () => {
        const projectRoot = "./test/core/integration/sample-project";
        await prepareDB(path.resolve(projectRoot));
        await processProject(projectRoot);
        const { driver: d, session: s } = setupNeo4j();
        driver = d;
        session = s;
    });

    afterAll(() => {
        teardownNeo4j({ session, driver });
    });

    describe("local variable declarations", () => {
        test("var x;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vVarUninitialized", fqn:'"./src/a.ts".vVarUninitialized', kind:"var"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"any"})
                AND NOT (var)-[:INITIALIZED_WITH]->()
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vLetUninitialized", fqn:'"./src/a.ts".vLetUninitialized', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"any"})
                AND NOT (var)-[:INITIALIZED_WITH]->()
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("var x = 0;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vVarInit", fqn:'"./src/a.ts".vVarInit', kind:"var"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:0})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = 0;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vLetInit", fqn:'"./src/a.ts".vLetInit', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:0})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("const x = 0;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vConstInit", fqn:'"./src/a.ts".vConstInit', kind:"const"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Literal {value:0})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:0})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x1 = 1, x2 = 2;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var1:TS:Variable {name:"vMulti1", fqn:'"./src/a.ts".vMulti1', kind:"let"})
                MATCH (file)-[:DECLARES]->(var2:TS:Variable {name:"vMulti2", fqn:'"./src/a.ts".vMulti2', kind:"let"})
                WHERE (var1)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var1)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:1})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var2)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var2)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:2})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var1, var2`);
            expect(result.records.length).toBe(1);
        });

        test("export let x = 5;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vExported", fqn:'"./src/a.ts".vExported', kind:"let"})
                WHERE (file)-[:EXPORTS {exportedName:"vExported"}]->(var)
                AND (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:5})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = undefined;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vUndefined", fqn:'"./src/a.ts".vUndefined', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"any"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Null {kind:"undefined"})-[:OF_TYPE]->(:TS:Type:Primitive {name:"undefined"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = null;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vNull", fqn:'"./src/a.ts".vNull', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"any"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Null {kind:"null"})-[:OF_TYPE]->(:TS:Type:Primitive {name:"null"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = true;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vTrue", fqn:'"./src/a.ts".vTrue', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"boolean"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:true})-[:OF_TYPE]->(:TS:Type:Primitive {name:"boolean"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = false;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vFalse", fqn:'"./src/a.ts".vFalse', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"boolean"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:false})-[:OF_TYPE]->(:TS:Type:Primitive {name:"boolean"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = 1;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vNumber", fqn:'"./src/a.ts".vNumber', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:1})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test('let x = "1";', async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vString", fqn:'"./src/a.ts".vString', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:"1"})-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = {...};", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vObject", fqn:'"./src/a.ts".vObject', kind:"let"})-[:OF_TYPE]->(t:TS:Type:Object)
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Object)
                MATCH (t)-[:HAS_MEMBER {name:"a"}]->(tA:TS:Type:Primitive {name:"number"})
                MATCH (t)-[:HAS_MEMBER {name:"b"}]->(tB:TS:Type:Primitive {name:"string"})
                MATCH (val)-[:HAS_MEMBER {name:"a"}]->(valA:TS:Value:Literal {value:1})
                MATCH (val)-[:HAS_MEMBER {name:"b"}]->(valB:TS:Value:Literal {value:"2"})
                WHERE (valA)-[:OF_TYPE]->(tA) AND (valB)-[:OF_TYPE]->(tB)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = [...];", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vArray", fqn:'"./src/a.ts".vArray', kind:"let"})-[:OF_TYPE]->(t:TS:Type:Declared {internal:false, referencedFqn:"Array"})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Array)-[:OF_TYPE]->(tVal:TS:Type:Declared {internal:false, referencedFqn:"Array"})
                MATCH (val)-[:CONTAINS {index: 0}]->(val1:TS:Value:Literal {value: 1})
                MATCH (val)-[:CONTAINS {index: 1}]->(val2:TS:Value:Literal {value: 2})
                MATCH (val)-[:CONTAINS {index: 2}]->(val3:TS:Value:Literal {value: 3})
                WHERE (t)-[:HAS_TYPE_ARGUMENT {index: 0}]->(:TS:Type:Primitive {name:"number"})
                AND (tVal)-[:HAS_TYPE_ARGUMENT {index: 0}]->(:TS:Type:Primitive {name:"number"})
                AND (val1)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val2)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val3)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x: [number, string] = [...];", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vTuple", fqn:'"./src/a.ts".vTuple', kind:"let"})-[:OF_TYPE]->(t:TS:Type:Tuple)
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Array)-[:OF_TYPE]->(tVal:TS:Type:Tuple)
                MATCH (val)-[:CONTAINS {index: 0}]->(val1:TS:Value:Literal {value: 1})
                MATCH (val)-[:CONTAINS {index: 1}]->(val2:TS:Value:Literal {value: "2"})
                WHERE (t)-[:CONTAINS {index: 0}]->(:TS:Type:Primitive {name:"number"})
                AND (t)-[:CONTAINS {index: 1}]->(:TS:Type:Primitive {name:"string"})
                AND (tVal)-[:CONTAINS {index: 0}]->(:TS:Type:Primitive {name:"number"})
                AND (tVal)-[:CONTAINS {index: 1}]->(:TS:Type:Primitive {name:"string"})
                AND (val1)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val2)-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = function(...) {...}", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vFunction", fqn:'"./src/a.ts".vFunction', kind:"let"})-[:OF_TYPE]->(t:TS:Type:Function)
                MATCH (var)-[:INITIALIZED_WITH]->(:TS:Value:Function {arrowFunction: false})-[:OF_TYPE]->(tVal:TS:Type:Function)
                WHERE (t)-[:RETURNS]->(:TS:Type:Primitive {name:"string"})
                AND (tVal)-[:RETURNS]->(:TS:Type:Primitive {name:"string"})
                AND (t)-[:HAS]->(:TS:Parameter {index:0, name:"p1", optional:false})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (tVal)-[:HAS]->(:TS:Parameter {index:0, name:"p1", optional:false})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = (...) => {...}", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vArrowFunction", fqn:'"./src/a.ts".vArrowFunction', kind:"let"})-[:OF_TYPE]->(t:TS:Type:Function)
                MATCH (var)-[:INITIALIZED_WITH]->(:TS:Value:Function {arrowFunction: true})-[:OF_TYPE]->(tVal:TS:Type:Function)
                WHERE (t)-[:RETURNS]->(:TS:Type:Primitive {name:"string"})
                AND (tVal)-[:RETURNS]->(:TS:Type:Primitive {name:"string"})
                AND (t)-[:HAS]->(:TS:Parameter {index:0, name:"p1", optional:false})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (tVal)-[:HAS]->(:TS:Parameter {index:0, name:"p1", optional:false})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        // TODO: variable with assigned class value: undefined variable type behavior
        test("let x = class {...}", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vClass", fqn:'"./src/a.ts".vClass', kind:"let"})
                WHERE (var)-[:INITIALIZED_WITH]->(:TS:Value:Class)-[:OF_TYPE]->(:TS:Type:NotIdentified {identifier:"class expression"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x: number | string = 1;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vUnion", fqn:'"./src/a.ts".vUnion', kind:"let"})
                MATCH (var)-[:OF_TYPE]->(t:TS:Type:Union)
                WHERE (t)-[:CONTAINS]->(:TS:Type:Primitive {name:"number"})
                AND (t)-[:CONTAINS]->(:TS:Type:Primitive {name:"string"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Literal {value:1})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x: {...} & {...} = {...};", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vIntersection", fqn:'"./src/a.ts".vIntersection', kind:"let"})
                MATCH (var)-[:OF_TYPE]->(t:TS:Type:Intersection)
                MATCH (t)-[:CONTAINS]->(tO1:TS:Type:Object)-[:HAS_MEMBER {name:"a"}]->(:TS:Type:Primitive {name:"number"})
                MATCH (t)-[:CONTAINS]->(tO2:TS:Type:Object)-[:HAS_MEMBER {name:"b"}]->(:TS:Type:Primitive {name:"string"})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Object)
                WHERE (val)-[:HAS_MEMBER {name:"a"}]->(:TS:Value:Literal {value:1})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val)-[:HAS_MEMBER {name:"b"}]->(:TS:Value:Literal {value:"a"})-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = 1 + 2;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vComplex", fqn:'"./src/a.ts".vComplex', kind:"let"})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:INITIALIZED_WITH]->(:TS:Value:Complex {expression:"1 + 2"})-[:OF_TYPE]->(:TS:Type:NotIdentified {identifier:"complex"})
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = y;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vRefDirect", fqn:'"./src/a.ts".vRefDirect', kind:"let"})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Declared {internal:true, referencedFqn:'"./src/a.ts".vNumber'})
                MATCH (val)-[:REFERENCES]->(var2:TS:Variable {name:"vNumber", fqn:'"./src/a.ts".vNumber'})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:DEPENDS_ON {cardinality:1}]->(var2)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = obj.a;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vRefMember", fqn:'"./src/a.ts".vRefMember', kind:"let"})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Member)
                MATCH (val)-[:PARENT]->(valP:TS:Value:Declared {internal:true, referencedFqn:'"./src/a.ts".vObject'})
                MATCH (valP)-[:REFERENCES]->(var2:TS:Variable {name:"vObject", fqn:'"./src/a.ts".vObject'})
                MATCH (valP)-[:OF_TYPE]->(tP:TS:Type:Object)
                MATCH (val)-[:MEMBER]->(valM:TS:Value:Declared {internal:false, referencedFqn:'a'})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (tP)-[:HAS_MEMBER {name:"a"}]->(:TS:Type:Primitive {name:"number"})
                AND (tP)-[:HAS_MEMBER {name:"b"}]->(:TS:Type:Primitive {name:"string"})
                AND (valM)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:DEPENDS_ON {cardinality:1}]->(var2)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x = fun(3);", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vRefCall", fqn:'"./src/a.ts".vRefCall', kind:"let"})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Call)
                MATCH (val)-[:CALLS]->(valC:TS:Value:Declared {internal:true, referencedFqn:'"./src/a.ts".vFunction'})
                MATCH (valC)-[:REFERENCES]->(var2:TS:Variable {name:"vFunction", fqn:'"./src/a.ts".vFunction'})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                AND (val)-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                AND (val)-[:HAS_ARGUMENT]->(:TS:Value:Literal {value:3})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:DEPENDS_ON {cardinality:1}]->(var2)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x: Interface = {...};", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vInterfaceObj", fqn:'"./src/a.ts".vInterfaceObj', kind:"let"})
                MATCH (var)-[:OF_TYPE]->(t:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomInterface'})
                MATCH (t)-[:REFERENCES]->(i:TS:Interface {name:"CustomInterface", fqn:'"./src/a.ts".CustomInterface'})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Object)
                WHERE (val)-[:HAS_MEMBER {name:"x"}]->(:TS:Value:Literal {value:1})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val)-[:HAS_MEMBER {name:"y"}]->(:TS:Value:Literal {value:2})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:DEPENDS_ON {cardinality:1}]->(i)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        // the cardinality is 2, because the class constructor is called during initialization
        test("let x = new Class();", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vClassObj", fqn:'"./src/a.ts".vClassObj', kind:"let"})
                MATCH (var)-[:OF_TYPE]->(t:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomClass'})
                MATCH (t)-[:REFERENCES]->(c:TS:Class {name:"CustomClass", fqn:'"./src/a.ts".CustomClass'})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Complex {expression:"new CustomClass(1, 2)"})
                WHERE (val)-[:OF_TYPE]->(:TS:Type:NotIdentified {identifier:"complex"})
                AND (var)-[:DEPENDS_ON {cardinality:2}]->(c)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        test("let x: TypeAlias = {...};", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vTypeObj", fqn:'"./src/a.ts".vTypeObj', kind:"let"})
                MATCH (var)-[:OF_TYPE]->(t:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomType'})
                MATCH (t)-[:REFERENCES]->(ta:TS:TypeAlias {name:"CustomType", fqn:'"./src/a.ts".CustomType'})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Object)
                WHERE (val)-[:HAS_MEMBER {name:"x"}]->(:TS:Value:Literal {value:1})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (val)-[:HAS_MEMBER {name:"y"}]->(:TS:Value:Literal {value:2})-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (var)-[:DEPENDS_ON {cardinality:1}]->(ta)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });

        // the cardinality is 2, because the enum if referenced during initialization
        test("let x: = Enum.MEMBER;", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(var:TS:Variable {name:"vEnum", fqn:'"./src/a.ts".vEnum', kind:"let"})
                MATCH (e:Enum {name:"CustomEnum", fqn:'"./src/a.ts".CustomEnum'})
                MATCH (var)-[:INITIALIZED_WITH]->(val:TS:Value:Member)
                MATCH (val)-[:PARENT]->(valP:TS:Value:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomEnum'})
                MATCH (val)-[:MEMBER]->(valM:TS:Value:Declared {internal:false, referencedFqn:'A'})
                WHERE (var)-[:OF_TYPE]->(:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomEnum'})-[:REFERENCES]->(e)
                AND (val)-[:OF_TYPE]->(:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomEnum'})-[:REFERENCES]->(e)
                AND (valM)-[:OF_TYPE]->(:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomEnum'})-[:REFERENCES]->(e)
                AND (valP)-[:REFERENCES]->(e)
                AND (var)-[:DEPENDS_ON {cardinality:2}]->(e)
                RETURN var`);
            expect(result.records.length).toBe(1);
        });
    });

    describe("local function declarations", () => {
        test("empty function", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fEmpty", fqn:'"./src/a.ts".fEmpty'})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("simple function that returns number", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fReturn", fqn:'"./src/a.ts".fReturn'})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"number"})
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("simple function that returns interface instance", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fReturnRef", fqn:'"./src/a.ts".fReturnRef'})
                MATCH (fun)-[:RETURNS]->(ret:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomInterface'})
                MATCH (i:TS:Interface {name:"CustomInterface", fqn:'"./src/a.ts".CustomInterface'})
                WHERE (ret)-[:REFERENCES]->(i)
                AND (fun)-[:DEPENDS_ON {cardinality:1}]->(i)
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("exported empty function", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fExported", fqn:'"./src/a.ts".fExported'})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (file)-[:EXPORTS {exportedName:"fExported"}]->(fun)
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("function with dependencies in body", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fBodyRef", fqn:'"./src/a.ts".fBodyRef'})
                MATCH (depC:TS:Class {name:"CustomClass", fqn:'"./src/a.ts".CustomClass'})
                MATCH (depF:TS:Function {name:"fEmpty", fqn:'"./src/a.ts".fEmpty'})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (fun)-[:DEPENDS_ON {cardinality:1}]->(depC)
                AND (fun)-[:DEPENDS_ON {cardinality:1}]->(depF)
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("function with single parameter", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fParam", fqn:'"./src/a.ts".fParam'})
                MATCH (fun)-[:HAS]->(p1:TS:Parameter {index:0, name:"p1", optional:false})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (p1)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("function with multiple parameters", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fMultiParam", fqn:'"./src/a.ts".fMultiParam'})
                MATCH (fun)-[:HAS]->(p1:TS:Parameter {index:0, name:"p1", optional:false})
                MATCH (fun)-[:HAS]->(p2:TS:Parameter {index:1, name:"p2", optional:false})
                MATCH (fun)-[:HAS]->(p3:TS:Parameter {index:2, name:"p3", optional:true})
                MATCH (p3)-[:OF_TYPE]->(tP3:TS:Type:Union)
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (p1)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (p2)-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                AND (tP3)-[:CONTAINS]->(:TS:Type:Primitive {name:"string"})
                AND (tP3)-[:CONTAINS]->(:TS:Type:Primitive {name:"undefined"})
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("generic function with single type parameter", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fGeneric", fqn:'"./src/a.ts".fGeneric'})
                MATCH (fun)-[:HAS]->(p1:TS:Parameter {index:0, name:"p1", optional:false})
                MATCH (fun)-[:DECLARES]->(tp:TS:TypeParameter {index:0, name:"T"})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (p1)-[:OF_TYPE]->(tp)
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("generic function with multiple type parameters", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fGenericMulti", fqn:'"./src/a.ts".fGenericMulti'})
                MATCH (fun)-[:HAS]->(p1:TS:Parameter {index:0, name:"p1", optional:false})
                MATCH (fun)-[:HAS]->(p2:TS:Parameter {index:1, name:"p2", optional:false})
                MATCH (fun)-[:DECLARES]->(tp1:TS:TypeParameter {index:0, name:"T"})
                MATCH (fun)-[:DECLARES]->(tp2:TS:TypeParameter {index:1, name:"U"})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (p1)-[:OF_TYPE]->(tp1)
                AND (p2)-[:OF_TYPE]->(tp2)
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("generic function with constrained type parameter", async () => {
            const result = await session.run(`
            MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
            MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fGenericConstraint", fqn:'"./src/a.ts".fGenericConstraint'})
            MATCH (fun)-[:HAS]->(p1:TS:Parameter {index:0, name:"p1", optional:false})
            MATCH (fun)-[:DECLARES]->(tp:TS:TypeParameter {index:0, name:"T"})
            MATCH (tp)-[:CONSTRAINED_BY]->(tC:TS:Type:Object)
            WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
            AND (tC)-[:HAS_MEMBER {name:"x"}]->(:TS:Type:Primitive {name:"number"})
            AND (p1)-[:OF_TYPE]->(tp)
            RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("generic function with type parameter constrained by type declaration", async () => {
            const result = await session.run(`
            MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
            MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fGenericConstraintRef", fqn:'"./src/a.ts".fGenericConstraintRef'})
            MATCH (fun)-[:HAS]->(p1:TS:Parameter {index:0, name:"p1", optional:false})
            MATCH (fun)-[:DECLARES]->(tp:TS:TypeParameter {index:0, name:"T"})
            MATCH (tp)-[:CONSTRAINED_BY]->(tC:TS:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomInterface'})
            MATCH (i:TS:Interface {name:"CustomInterface", fqn:'"./src/a.ts".CustomInterface'})
            WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
            AND (tC)-[:REFERENCES]->(i)
            AND (p1)-[:OF_TYPE]->(tp)
            AND (fun)-[:DEPENDS_ON {cardinality:1}]->(i)
            RETURN fun`);
            expect(result.records.length).toBe(1);
        });

        test("nested function", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(fun:TS:Function {name:"fNested", fqn:'"./src/a.ts".fNested'})
                WHERE (fun)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                RETURN fun`);
            expect(result.records.length).toBe(1);
        });
    });

    describe("local class declarations", () => {
        test("empty class", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cEmpty", fqn:'"./src/a.ts".cEmpty'})
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("exported empty class", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cExported", fqn:'"./src/a.ts".cExported'})
                WHERE (file)-[:EXPORTS {exportedName:"cExported"}]->(c)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class with properties", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cProperties", fqn:'"./src/a.ts".cProperties'})
                MATCH (c)-[:DECLARES]->(x:TS:Property {abstract: false, fqn:'"./src/a.ts".cProperties.x', name:"x", optional:false, override:false, readonly:false, static:false, visibility:"private"})
                MATCH (c)-[:DECLARES]->(y:TS:Property {abstract: false, fqn:'"./src/a.ts".cProperties.y', name:"y", optional:false, override:false, readonly:false, static:false, visibility:"protected"})
                MATCH (c)-[:DECLARES]->(z:TS:Property {abstract: false, fqn:'"./src/a.ts".cProperties.z', name:"z", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(w:TS:Property {abstract: false, fqn:'"./src/a.ts".cProperties.w', name:"w", optional:false, override:false, readonly:false, static:false, visibility:"js_private"})
                MATCH (c)-[:DECLARES]->(a:TS:Property {abstract: false, fqn:'"./src/a.ts".cProperties.a', name:"a", optional:false, override:false, readonly:true, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(b:TS:Property {abstract: false, fqn:'"./src/a.ts".cProperties.b', name:"b", optional:true, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (b)-[:OF_TYPE]->(tB:TS:Type:Union)
                WHERE (x)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (y)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (z)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (w)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (a)-[:OF_TYPE]->(:TS:Type:Literal {value:5})
                AND (tB)-[:CONTAINS]->(:TS:Type:Primitive {name:"number"})
                AND (tB)-[:CONTAINS]->(:TS:Type:Primitive {name:"undefined"})
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class with constructor", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cConstructor", fqn:'"./src/a.ts".cConstructor'})
                MATCH (c)-[:DECLARES]->(x:TS:Property {abstract: false, fqn:'"./src/a.ts".cConstructor.x', name:"x", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(y:TS:Property {abstract: false, fqn:'"./src/a.ts".cConstructor.y', name:"y", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(cc:TS:Method:Constructor {fqn:'"./src/a.ts".cConstructor.constructor'})
                MATCH (cc)-[:HAS]->(cx:TS:Parameter {index:0, name:"x", optional:false})
                MATCH (cc)-[:HAS]->(cy:TS:Parameter {index:1, name:"y", optional:false})
                WHERE (x)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (y)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (cx)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (cy)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND NOT (cc)-[:DEPENDS_ON]->(:TS)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class with methods", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cMethods", fqn:'"./src/a.ts".cMethods'})
                MATCH (c)-[:DECLARES]->(x:TS:Method {abstract: false, fqn:'"./src/a.ts".cMethods.x', name:"x", override:false, static:false, visibility:"private"})
                MATCH (c)-[:DECLARES]->(y:TS:Method {abstract: false, fqn:'"./src/a.ts".cMethods.y', name:"y", override:false, static:false, visibility:"protected"})
                MATCH (c)-[:DECLARES]->(z:TS:Method {abstract: false, fqn:'"./src/a.ts".cMethods.z', name:"z", override:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(w:TS:Method {abstract: false, fqn:'"./src/a.ts".cMethods.w', name:"w", override:false, static:false, visibility:"js_private"})
                MATCH (c)-[:DECLARES]->(a:TS:Method {abstract: false, fqn:'"./src/a.ts".cMethods.a', name:"a", override:false, static:false, visibility:"public"})
                MATCH (a)-[:HAS]->(aP1:TS:Parameter {index:0, name:"p1", optional:false})
                MATCH (a)-[:HAS]->(aP2:TS:Parameter {index:1, name:"p2", optional:false})
                WHERE (x)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (y)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (z)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (w)-[:RETURNS]->(:TS:Type:Primitive {name:"void"})
                AND (a)-[:RETURNS]->(:TS:Type:Primitive {name:"string"})
                AND (aP1)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (aP2)-[:OF_TYPE]->(:TS:Type:Primitive {name:"string"})
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        // TODO: general improvements to getters and setters needed (maybe additional referenced property node?)
        test("class with getters and setters", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cGetterSetter", fqn:'"./src/a.ts".cGetterSetter'})
                MATCH (c)-[:DECLARES]->(gx:TS:Method:Getter {abstract: false, fqn:'"./src/a.ts".cGetterSetter.x', name:"x", override:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(sx:TS:Method {abstract: false, fqn:'"./src/a.ts".cGetterSetter.x', name:"x", override:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(gy:TS:Method {abstract: false, fqn:'"./src/a.ts".cGetterSetter.y', name:"y", override:false, static:false, visibility:"private"})
                MATCH (c)-[:DECLARES]->(sy:TS:Method {abstract: false, fqn:'"./src/a.ts".cGetterSetter.y', name:"y", override:false, static:false, visibility:"private"})
                MATCH (sx)-[:HAS]->(sxP:TS:Parameter {index:0, name:"x", optional:false})
                MATCH (sy)-[:HAS]->(syP:TS:Parameter {index:0, name:"y", optional:false})
                WHERE (gx)-[:RETURNS]->(:TS:Type:Primitive {name:"number"})
                AND (gy)-[:RETURNS]->(:TS:Type:Primitive {name:"number"})
                AND (sxP)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (syP)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class with parameter properties", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cParameterProperties", fqn:'"./src/a.ts".cParameterProperties'})
                MATCH (c)-[:DECLARES]->(x:TS:Property {abstract: false, fqn:'"./src/a.ts".cParameterProperties.x', name:"x", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(y:TS:Property {abstract: false, fqn:'"./src/a.ts".cParameterProperties.y', name:"y", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(cc:TS:Method:Constructor {fqn:'"./src/a.ts".cParameterProperties.constructor'})
                MATCH (cc)-[:HAS]->(cx:TS:Parameter {index:0, name:"x", optional:false})
                MATCH (cc)-[:HAS]->(cy:TS:Parameter {index:1, name:"y", optional:false})
                WHERE (x)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (y)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (cx)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (cy)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (cx)-[:DECLARES]->(x)
                AND (cy)-[:DECLARES]->(y)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class with static members", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cStatic", fqn:'"./src/a.ts".cStatic'})
                MATCH (c)-[:DECLARES]->(a:TS:Property {abstract: false, fqn:'"./src/a.ts".cStatic.staticA', name:"staticA", optional:false, override:false, readonly:false, static:true, visibility:"public"})
                MATCH (c)-[:DECLARES]->(sum:TS:Method {abstract: false, fqn:'"./src/a.ts".cStatic.staticSum', name:"staticSum", override:false, static:true, visibility:"public"})
                MATCH (sum)-[:HAS]->(sumX:TS:Parameter {index:0, name:"x", optional:false})
                MATCH (sum)-[:HAS]->(sumY:TS:Parameter {index:1, name:"y", optional:false})
                WHERE (a)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (sum)-[:RETURNS]->(:TS:Type:Primitive {name:"number"})
                AND (sumX)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (sumY)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("abstract class", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cAbstract", fqn:'"./src/a.ts".cAbstract'})
                MATCH (c)-[:DECLARES]->(aA:TS:Property {abstract: true, fqn:'"./src/a.ts".cAbstract.abstractA', name:"abstractA", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(sumA:TS:Method {abstract: true, fqn:'"./src/a.ts".cAbstract.abstractSum', name:"abstractSum", override:false, static:false, visibility:"public"})
                MATCH (sumA)-[:HAS]->(sumAX:TS:Parameter {index:0, name:"x", optional:false})
                MATCH (sumA)-[:HAS]->(sumAY:TS:Parameter {index:1, name:"y", optional:false})
                MATCH (c)-[:DECLARES]->(a:TS:Property {abstract: false, fqn:'"./src/a.ts".cAbstract.nonAbstractA', name:"nonAbstractA", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(sum:TS:Method {abstract: false, fqn:'"./src/a.ts".cAbstract.nonAbstractSum', name:"nonAbstractSum", override:false, static:false, visibility:"public"})
                MATCH (sumA)-[:HAS]->(sumX:TS:Parameter {index:0, name:"x", optional:false})
                MATCH (sumA)-[:HAS]->(sumY:TS:Parameter {index:1, name:"y", optional:false})
                WHERE (aA)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (sumA)-[:RETURNS]->(:TS:Type:Primitive {name:"number"})
                AND (sumAX)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (sumAY)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (a)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (sum)-[:RETURNS]->(:TS:Type:Primitive {name:"number"})
                AND (sumX)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (sumY)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class extending other class", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cExtends", fqn:'"./src/a.ts".cExtends'})
                MATCH (c)-[:DECLARES]->(x:TS:Property {abstract: false, fqn:'"./src/a.ts".cExtends.x', name:"x", optional:false, override:true, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:EXTENDS]->(superT:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomClass'})
                MATCH (superC:TS:Class {name:"CustomClass", fqn:'"./src/a.ts".CustomClass'})
                WHERE (x)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (superT)-[:REFERENCES]->(superC)
                AND (c)-[:DEPENDS_ON {cardinality:1}]->(superC)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class implenting interface", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cImplements", fqn:'"./src/a.ts".cImplements'})
                MATCH (c)-[:DECLARES]->(x:TS:Property {abstract: false, fqn:'"./src/a.ts".cImplements.x', name:"x", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:DECLARES]->(y:TS:Property {abstract: false, fqn:'"./src/a.ts".cImplements.y', name:"y", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (c)-[:IMPLEMENTS]->(implT:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomInterface'})
                MATCH (implI:TS:Interface {name:"CustomInterface", fqn:'"./src/a.ts".CustomInterface'})
                WHERE (x)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (y)-[:OF_TYPE]->(:TS:Type:Primitive {name:"number"})
                AND (implT)-[:REFERENCES]->(implI)
                AND (c)-[:DEPENDS_ON {cardinality:1}]->(implI)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("class with dependencies", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cRef", fqn:'"./src/a.ts".cRef'})
                MATCH (c)-[:DECLARES]->(x:TS:Property {abstract: false, fqn:'"./src/a.ts".cRef.x', name:"x", optional:false, override:false, readonly:false, static:false, visibility:"public"})
                MATCH (x)-[:OF_TYPE]->(tX:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomInterface'})
                MATCH (c)-[:DECLARES]->(m:TS:Method {abstract: false, fqn:'"./src/a.ts".cRef.method', name:"method", override:false, static:false, visibility:"public"})
                MATCH (m)-[:RETURNS]->(tM:Type:Declared {internal:true, referencedFqn:'"./src/a.ts".CustomClass'})
                MATCH (cc:TS:Class {name:"CustomClass", fqn:'"./src/a.ts".CustomClass'})
                MATCH (ci:TS:Interface {name:"CustomInterface", fqn:'"./src/a.ts".CustomInterface'})
                WHERE (tX)-[:REFERENCES]->(ci)
                AND (tM)-[:REFERENCES]->(cc)
                AND (x)-[:DEPENDS_ON {cardinality:1}]->(ci)
                AND (c)-[:DEPENDS_ON {cardinality:1}]->(ci)
                AND (m)-[:DEPENDS_ON {cardinality:2}]->(cc)
                AND (c)-[:DEPENDS_ON {cardinality:2}]->(cc)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });

        test("generic class", async () => {
            const result = await session.run(`
                MATCH (file:File:TS:Module {fileName:"/src/a.ts"})
                MATCH (file)-[:DECLARES]->(c:TS:Class {name:"cGeneric", fqn:'"./src/a.ts".cGeneric'})
                MATCH (c)-[:DECLARES]->(tpC:TS:TypeParameter {index:0, name:"T"})
                MATCH (c)-[:DECLARES]->(m:TS:Method {abstract: false, fqn:'"./src/a.ts".cGeneric.method', name:"method", override:false, static:false, visibility:"public"})
                MATCH (m)-[:HAS]->(mP1:TS:Parameter {index:0, name:"p1", optional:false})
                MATCH (c)-[:DECLARES]->(mn:TS:Method {abstract: false, fqn:'"./src/a.ts".cGeneric.methodNested', name:"methodNested", override:false, static:false, visibility:"public"})
                MATCH (mn)-[:DECLARES]->(tpMN:TS:TypeParameter {index:0, name:"U"})
                MATCH (mn)-[:HAS]->(mnP1:TS:Parameter {index:0, name:"p1", optional:false})
                MATCH (mn)-[:HAS]->(mnP2:TS:Parameter {index:1, name:"p2", optional:false})
                WHERE (m)-[:RETURNS]->(tpC)
                AND (mP1)-[:OF_TYPE]->(tpC)
                AND (mn)-[:RETURNS]->(tpMN)
                AND (mnP1)-[:OF_TYPE]->(tpC)
                AND (mnP2)-[:OF_TYPE]->(tpMN)
                RETURN c`);
            expect(result.records.length).toBe(1);
        });
    });
});
