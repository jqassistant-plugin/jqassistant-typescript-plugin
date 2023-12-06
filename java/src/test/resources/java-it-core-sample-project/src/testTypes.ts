import { BaseInterface, BaseInterface2 } from "./utils";

type typePrimitive = number;

type typeDeclared = BaseInterface;

type typeUnion = string | number;

type typeIntersection = BaseInterface & BaseInterface2;

type typeObject = {
    a: number;
    b: string;
};

type typeFunction = <A extends typeObject>(x: number, y: A) => string;

type typeLiteral = 1;

type typeTuple = [string, number];
