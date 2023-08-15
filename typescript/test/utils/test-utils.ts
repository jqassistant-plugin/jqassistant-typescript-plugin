import { LCEDependency } from "../../src/core/concepts/dependency.concept";
import { LCEConcept } from "../../src/core/concept";
import {
    LCEType,
    LCETypeDeclared,
    LCETypeFunctionParameter,
    LCETypeLiteral,
    LCETypeObject,
    LCETypeParameterReference,
    LCETypePrimitive,
    LCETypeUnion,
} from "../../src/core/concepts/type.concept";
import { LCEValue, LCEValueLiteral } from "../../src/core/concepts/value.concept";
import { LCEMethodDeclaration, LCEParameterDeclaration } from "../../src/core/concepts/method-declaration.concept";
import { LCETypeParameterDeclaration } from "../../src/core/concepts/type-parameter.concept";
import { LCEPropertyDeclaration } from "../../src/core/concepts/property-declaration.concept";
import { Visibility } from "../../src/core/concepts/visibility.concept";

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
    expect(dependency).not.toBeUndefined();
    expect(dependency!.cardinality).toBe(cardinality);
}

/**
 * Expect the provided type to be not null and of the specified primitive variant.
 */
export function expectPrimitiveType(type: LCEType | undefined, name: string) {
    expect(type).not.toBeNull();
    if(type) {
        expect(type.type).toBe("primitive");
        expect((type as LCETypePrimitive).name).toBe(name);
    }
}

/**
 * Expect the provided type to be not null and a union of the specified primitive variant and undefined.
 */
export function expectOptionalPrimitiveType(type: LCEType | undefined, name: string) {
    const types = ["undefined", name].sort();
    expect(type).not.toBeNull();
    if(type) {
        expect(type).not.toBeNull();
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
    expect(type).not.toBeNull();
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
    expect(type).not.toBeNull();
    if(type) {
        expect(type.type).toBe("declared");
        expect((type as LCETypeDeclared).fqn).toBe(fqn);
        if(checkEmptyTypeArgs) {
            expect((type as LCETypeDeclared).typeArguments).toHaveLength(0);
        }
    }
}

/**
 * Expect the provided type to be not null and of the specified type parameter reference variant.
 */
export function expectTypeParameterReference(type: LCEType | undefined, name: string) {
    expect(type).not.toBeNull();
    if(type) {
        expect(type.type).toBe("type-parameter");
        expect((type as LCETypeParameterReference).name).toBe(name);
    }
}

/**
 * Expect the provided value (and its associated type) to be not null and of the specified literal variant.
 */
export function expectLiteralValue(value: LCEValue | undefined, literalValue: any, primitiveType: string){
    expect(value).not.toBeNull();
    if(value) {
        expect(value.valueType).toBe("literal");
        expect((value as LCEValueLiteral).value).toBe(literalValue);
        expectPrimitiveType(value.type, primitiveType);
    }
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
    expect(params).not.toBeNull();
    const param = params![index];
    expect(param).not.toBeNull();
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
    expect(typeParams).not.toBeNull();
    const typeParam = typeParams![index];
    expect(typeParam).not.toBeNull();
    if(typeParam) {
        expect(typeParam.index).toBe(index);
        expect(typeParam.name).toBe(name);
        if(checkEmptyConstraint) {
            expect(typeParam.constraint).not.toBeNull();
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
    expect(props).not.toBeNull();
    const propDecl = props!.find(p => p.fqn === fqn);
    expect(propDecl).not.toBeNull();
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
                               primitiveReturnType?: string): LCEMethodDeclaration {
    expect(methods).not.toBeNull();
    const methodDecl = methods!.find(p => p.fqn === fqn);
    expect(methodDecl).not.toBeNull();
    if(methodDecl) {
        expect(methodDecl.methodName).toBe(name);
        expect(methodDecl.visibility).toBe(visibility);
        expect(methodDecl.override).toBe(override);
        expect(methodDecl.abstract).toBe(abstract);
        expect(methodDecl.isStatic).toBe(isStatic);

        if(primitiveReturnType) {
            expectPrimitiveType(methodDecl.returnType, primitiveReturnType);
        }
    }
    return methodDecl!;
}
