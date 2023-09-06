import { LCEDependency } from "../../src/core/concepts/dependency.concept";
import { LCEConcept } from "../../src/core/concept";
import {
    LCEType,
    LCETypeDeclared,
    LCETypeFunction,
    LCETypeFunctionParameter,
    LCETypeLiteral,
    LCETypeObject,
    LCETypeObjectMember,
    LCETypeParameterReference,
    LCETypePrimitive,
    LCETypeUnion
} from "../../src/core/concepts/type.concept";
import { LCEValue, LCEValueDeclared, LCEValueLiteral, LCEValueObject } from "../../src/core/concepts/value.concept";
import { LCEMethodDeclaration, LCEParameterDeclaration } from "../../src/core/concepts/method-declaration.concept";
import { LCETypeParameterDeclaration } from "../../src/core/concepts/type-parameter.concept";
import { LCEPropertyDeclaration } from "../../src/core/concepts/property-declaration.concept";
import { Visibility } from "../../src/core/concepts/visibility.concept";
import { LCEAccessorProperty } from "../../src/core/concepts/accessor-declaration.concept";
import { LCEModule } from "../../src/core/concepts/typescript-module.concept";
import { LCEEnumDeclaration } from "../../src/core/concepts/enum-declaration.concept";
import { LCEExportDeclaration } from "../../src/core/concepts/export-declaration.concept";
import { execSync } from "child_process";
import fs from "fs";


/**
 * Checks if Node.js has been initialized for the provided sample project.
 * Runs `npm install` if that's not the case.
 */
export function initNodeSampleProject(path: string) {
    const files = fs.readdirSync(path);
    if(!files.includes("node_modules")) {
        console.log("Installing Node.js packages for sample project: " + path);
        execSync("npm i", {cwd: path});
    }
}


/**
 * Returns a map containing all dependencies of the given result data, mapped by source and target FQN.
 * The result of this function should be passed to {@link expectDependency}
 */
export function getDependenciesFromResult(result: Map<string, LCEConcept[]>): Map<string, Map<string, LCEDependency>> {
    const dependencies: Map<string, Map<string, LCEDependency>> = new Map();
    for (const concept of result.get(LCEDependency.conceptId) ?? []) {
        const dep: LCEDependency = concept as LCEDependency;
        if (!dep.sourceFQN) {
            throw new Error("Dependency has no source fqn " + JSON.stringify(dep));
        }
        if (!dep.fqn) {
            throw new Error("Dependency has no target fqn " + JSON.stringify(dep));
        }
        if (dependencies.get(dep.sourceFQN)?.get(dep.fqn)) {
            throw new Error("Two dependencies with same source and target FQN were returned: " + JSON.stringify(dep));
        }

        if (!dependencies.has(dep.sourceFQN)) {
            dependencies.set(dep.sourceFQN, new Map());
        }
        dependencies.get(dep.sourceFQN)?.set(dep.fqn, dep);
    }

    return dependencies;
}

/**
 * Test if a certain dependency was registered during language concept extraction
 * @param dependencies map of all dependencies (obtain via `getDependenciesFromResult`)
 * @param sourceFqn fqn of source concept
 * @param targetFqn fqn of target concept
 * @param cardinality cardinality of dependency (remember that there are no transitive/aggregated dependencies after LCE)
 */
export function expectDependency(dependencies: Map<string, Map<string, LCEDependency>>, sourceFqn: string, targetFqn: string, cardinality: number) {
    const dependency = dependencies.get(sourceFqn)?.get(targetFqn);
    expect(dependency).toBeDefined();
    expect(dependency!.cardinality).toBe(cardinality);
}

/**
 * Expect the provided type to be not null and of the specified primitive variant.
 */
export function expectPrimitiveType(type: LCEType | undefined, name: string) {
    expect(type).toBeDefined();
    if(type) {
        expect(type.type).toBe("primitive");
        expect((type as LCETypePrimitive).name).toBe(name);
    }
}

/**
 * Expect the provided type to be not null and a union of the specified primitive variant and `undefined`.
 */
export function expectOptionalPrimitiveType(type: LCEType | undefined, name: string) {
    const types = ["undefined", name].sort();
    expect(type).toBeDefined();
    if(type) {
        expect(type).toBeDefined();
        expect(type.type).toBe("union");
        const unionTypes = (type as LCETypeUnion).types;

        expect(unionTypes).toHaveLength(2);
        expect(unionTypes[0].type).toBe("primitive");
        expect(unionTypes[1].type).toBe("primitive");
        unionTypes.sort((a, b) => (a as LCETypePrimitive).name.localeCompare((b as LCETypePrimitive).name))
        expect((unionTypes[0] as LCETypePrimitive).name).toBe(types[0]);
        expect((unionTypes[1] as LCETypePrimitive).name).toBe(types[1]);
    }
}

/**
 * Expect the provided type to be not null and of the specified literal variant.
 */
export function expectLiteralType(type: LCEType | undefined, value: any) {
    expect(type).toBeDefined();
    if(type) {
        expect(type.type).toBe("literal");
        expect((type as LCETypeLiteral).value).toBe(value);
    }
}

/**
 * Expect the provided type to be not null and of the specified declared variant.
 * Assumes by default that there are no specified type arguments. (can be turned off via `checkEmptyTypeArgs` parameter)
 */
export function expectDeclaredType(type: LCEType | undefined, fqn: string, checkEmptyTypeArgs: boolean = true) {
    expect(type).toBeDefined();
    if(type) {
        expect(type.type).toBe("declared");
        expect((type as LCETypeDeclared).fqn).toBe(fqn);
        if(checkEmptyTypeArgs) {
            expect((type as LCETypeDeclared).typeArguments).toHaveLength(0);
        }
    }
    return type as LCETypeDeclared;
}

/**
 * Expect the provided type to be not null and of the specified type parameter reference variant.
 */
export function expectTypeParameterReference(type: LCEType | undefined, name: string) {
    expect(type).toBeDefined();
    if(type) {
        expect(type.type).toBe("type-parameter");
        expect((type as LCETypeParameterReference).name).toBe(name);
    }
}

/**
 * Expect the provided type to be not null and a function type with the specified number of parameters.
 * Optionally checks if the function returns a certain primitive type.
 * By default, checks that there are no defined type parameters
 */
export function expectFunctionType(funType: LCEType | undefined, paramCount: number, primitiveReturnType?: string, checkEmptyTypeParams: boolean = true): LCETypeFunction {
    expect(funType).toBeDefined();
    expect(funType!.type).toBe("function");
    expect((funType as LCETypeFunction).parameters).toBeDefined();
    expect((funType as LCETypeFunction).parameters).toHaveLength(paramCount);
    if(primitiveReturnType) {
        expectPrimitiveType((funType as LCETypeFunction).returnType, primitiveReturnType);
    }
    if(checkEmptyTypeParams) {
        expect((funType as LCETypeFunction).typeParameters).toHaveLength(0);
    }
    return funType! as LCETypeFunction;
}

/**
 * Expect the provided type to be not null and an object type with the specified number of members.
 */
export function expectObjectType(objectType: LCEType | undefined, memberCount: number) {
    expect(objectType).toBeDefined();
    expect(objectType!.type).toBe("object");
    expect((objectType! as LCETypeObject).members).toBeDefined();
    expect((objectType! as LCETypeObject).members).toHaveLength(memberCount);
    return objectType! as LCETypeObject;
}

/**
 * Expects a member in the provided object type.
 * Optionally checks if the member is of a certain primitive type.
 */
export function expectObjectTypeMember(objectType: LCETypeObject, name: string, optional: boolean = false, readonly: boolean = false, primitiveType?: string): LCETypeObjectMember {
    let member = objectType.members.find(mem => mem.name === name);
    expect(member).toBeDefined();
    const tom = member! as LCETypeObjectMember;
    expect(tom.optional).toBe(optional);
    expect(tom.readonly).toBe(readonly);
    if(primitiveType) {
        expectPrimitiveType(tom.type, primitiveType);
    }
    return member!;
}

/**
 * Expect the provided value (and its associated type) to be not null and of the specified literal variant.
 */
export function expectLiteralValue(value: LCEValue | undefined, literalValue: any, primitiveType: string){
    expect(value).toBeDefined();
    expect(value!.valueType).toBe("literal");
    expect((value! as LCEValueLiteral).value).toBe(literalValue);
    expectPrimitiveType(value!.type, primitiveType);
    return value! as LCEValueLiteral;
}

/**
 * Expect the provided value to be not null and of the specified declared variant.
 */
export function expectDeclaredValue(value: LCEValue | undefined, fqn: string) {
    expect(value).toBeDefined();
    expect(value!.valueType).toBe("declared");
    expect((value! as LCEValueDeclared).fqn).toBe(fqn);
    return value! as LCEValueDeclared;
}

/**
 * Expect the provided value to be not null and an object value with the specified number of members.
 */
export function expectObjectValue(value: LCEValue | undefined, memberCount: number) {
    expect(value).toBeDefined();
    expect(value!.valueType).toBe("object");
    expect((value! as LCEValueObject).members).toBeDefined();
    expect([...(value! as LCEValueObject).members.entries()]).toHaveLength(memberCount);
    return value! as LCEValueObject;
}

/**
 * Expects a parameter to present in the provided parameter list.
 * @param params list of all parameter of a function or function type
 * @param index index of the parameter (position within the list as well as for checking the index value of the object)
 * @param name name of the parameter
 * @param optional optional property value of the parameter to check
 * @param primitiveType optional: additional check of parameter type for the specified primitive type variant
 */
export function expectFunctionParameter(params: LCETypeFunctionParameter[] | LCEParameterDeclaration[] | undefined,
                                        index: number,
                                        name: string,
                                        optional: boolean,
                                        primitiveType: string | undefined = undefined) {
    expect(params).toBeDefined();
    const param = params![index];
    expect(param).toBeDefined();
    if(param) {
        expect(param.index).toBe(index);
        expect(param.name).toBe(name);
        expect(param.optional).toBe(optional);
        if(primitiveType) {
            expectPrimitiveType(param.type, primitiveType);
        }
    }
}

/**
 * Expects a type parameter to present in the provided type parameter list.
 * @param typeParams list of type parameter declarations
 * @param index index of the type parameter (position within the list as well as for checking the index value of the object)
 * @param name name of the type parameter
 * @param checkEmptyConstraint (enabled by default): checks that the type parameter is constraint by an empty object type
 */
export function expectTypeParameterDeclaration(typeParams: LCETypeParameterDeclaration[] | undefined,
                                               index: number,
                                               name: string,
                                               checkEmptyConstraint: boolean = true) {
    expect(typeParams).toBeDefined();
    const typeParam = typeParams![index];
    expect(typeParam).toBeDefined();
    if(typeParam) {
        expect(typeParam.index).toBe(index);
        expect(typeParam.name).toBe(name);
        if(checkEmptyConstraint) {
            expect(typeParam.constraint).toBeDefined();
            expect(typeParam.constraint.type).toBe("object");
            expect([...(typeParam.constraint as LCETypeObject).members.entries()]).toHaveLength(0);
        }
    }
}


/**
 * Expects a property to present in the provided property list.
 *
 * @return property declaration object, if it was found in the list
 */
export function expectProperty(props: LCEPropertyDeclaration[] | undefined,
                               fqn: string,
                               name: string,
                               optional: boolean,
                               visibility: Visibility,
                               readonly: boolean,
                               override: boolean | undefined,
                               abstract: boolean | undefined,
                               isStatic: boolean | undefined,
                               primitiveType?: string): LCEPropertyDeclaration {
    expect(props).toBeDefined();
    const propDecl = props!.find(p => p.fqn === fqn);
    expect(propDecl).toBeDefined();
    if(propDecl) {
        expect(propDecl.propertyName).toBe(name);
        expect(propDecl.optional).toBe(optional);
        expect(propDecl.visibility).toBe(visibility);
        expect(propDecl.readonly).toBe(readonly);
        expect(propDecl.override).toBe(override);
        expect(propDecl.abstract).toBe(abstract);
        expect(propDecl.isStatic).toBe(isStatic);

        if(primitiveType) {
            expectPrimitiveType(propDecl.type, primitiveType);
        }
    }
    return propDecl!;
}

/**
 * Expects a method to present in the provided method list.
 * Only performs basic checks: (type) parameters have to be checked manually.
 *
 * @return property declaration object, if it was found in the list
 */
export function expectMethod(methods: LCEMethodDeclaration[] | undefined,
                             fqn: string,
                             name: string,
                             visibility: Visibility,
                             override: boolean | undefined,
                             abstract: boolean | undefined,
                             isStatic: boolean | undefined,
                             primitiveReturnType?: string,
                             async: boolean = false): LCEMethodDeclaration {
    expect(methods).toBeDefined();
    const methodDecl = methods!.find(p => p.fqn === fqn);
    expect(methodDecl).toBeDefined();
    if(methodDecl) {
        expect(methodDecl.methodName).toBe(name);
        expect(methodDecl.visibility).toBe(visibility);
        expect(methodDecl.async).toBe(async);
        expect(methodDecl.override).toBe(override);
        expect(methodDecl.abstract).toBe(abstract);
        expect(methodDecl.isStatic).toBe(isStatic);

        if(primitiveReturnType) {
            expectPrimitiveType(methodDecl.returnType, primitiveReturnType);
        }
    }
    return methodDecl!;
}

export function expectAccessorProperty(accessorProperties: LCEAccessorProperty[] | undefined,
                                       fqn: string,
                                       name: string): LCEAccessorProperty {
    expect(accessorProperties).toBeDefined();
    const accProp = accessorProperties!.find(p => p.fqn === fqn);
    expect(accProp).toBeDefined();
    if(accProp) {
        expect(accProp.accessorName).toBe(name);
    }
    return accProp!;
}

/**
 * Expect that the given enum declaration has a certain member.
 */
export function expectEnumMember(enumDecl: LCEEnumDeclaration, name: string, fqn: string) {
    const member = enumDecl.members.find(mem => mem.enumMemberName === name);
    expect(member).toBeDefined();
    expect(member!.fqn).toBe(fqn);
    return member!;
}

export function expectModule(modules: Map<string, LCEModule>, fqn: string, graphPath: string, present: boolean = true) {
    const module = modules.get(fqn);
    if(present) {
        expect(module).toBeDefined();
        if(module) {
            expect(module.path).toBe(graphPath);
        }
    } else {
        expect(module).toBeUndefined();
    }
}

export function expectExport(exports: LCEExportDeclaration[], fqn: string, identifier: string, alias?: string) {
    const exp = exports.find(e => e.declFqn === fqn);
    expect(exp).toBeDefined();
    expect(exp!.identifier).toBe(identifier);
    expect(exp!.alias).toBe(alias);
}
