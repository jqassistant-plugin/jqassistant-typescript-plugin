/* eslint-disable @typescript-eslint/ban-types */
import {
    ArrowFunctionExpression,
    ClassDeclaration,
    ClassPropertyNameNonComputed,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    MethodDefinitionNonComputedName,
    Node as ESNode,
    TSAbstractMethodDefinitionNonComputedName,
    TSClassImplements,
    TSDeclareFunction,
    TSInterfaceDeclaration,
    TSInterfaceHeritage,
    TSMethodSignatureNonComputedName,
    TSTypeAliasDeclaration,
    TypeNode,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import {
    isTypeParameterDeclaration,
    Node,
    ParameterDeclaration,
    PseudoBigInt,
    Signature,
    SignatureKind,
    Symbol,
    Type,
    TypeReference,
} from "typescript";

import {LCETypeParameterDeclaration} from "../concepts/type-parameter.concept";
import {
    LCEType,
    LCETypeDeclared,
    LCETypeFunction,
    LCETypeFunctionParameter,
    LCETypeIntersection,
    LCETypeLiteral,
    LCETypeNotIdentified,
    LCETypeObject,
    LCETypeParameterReference,
    LCETypePrimitive,
    LCETypeTuple,
    LCETypeUnion,
} from "../concepts/type.concept";
import {ProcessingContext} from "../context";
import {PathUtils} from "../path.utils";
import {DependencyResolutionProcessor} from "./dependency-resolution.processor";

/**
 * Returns the type for a given class property (with a non-computed name)
 * @param esProperty property name node provided in ESTree
 * @returns LCEType with encoded type information
 */
export function parseClassPropertyType(processingContext: ProcessingContext, esProperty: ClassPropertyNameNonComputed): LCEType {
    const globalContext = processingContext.globalContext;
    const node = globalContext.services.esTreeNodeToTSNodeMap.get(esProperty);
    return parseType(processingContext, globalContext.typeChecker.getTypeAtLocation(node), node);
}

/**
 * Returns the type for a given method (with a non-computed name).
 * This includes constructors, getters and setters.
 * @param esProperty method name node provided in ESTree
 * @returns LCEType with encoded type information
 */
export function parseMethodType(
    processingContext: ProcessingContext,
    esClassLikeDecl: ClassDeclaration | TSInterfaceDeclaration,
    esMethodDecl: MethodDefinitionNonComputedName | TSAbstractMethodDefinitionNonComputedName | TSMethodSignatureNonComputedName,
    methodName: string,
    jsPrivate: boolean
): LCETypeFunction | undefined {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;
    const classNode = globalContext.services.esTreeNodeToTSNodeMap.get(esClassLikeDecl);
    const classType = tc.getTypeAtLocation(classNode);
    let propertySym: Symbol | undefined;
    if (jsPrivate) {
        for (const sym of classType.getProperties()) {
            if (sym.getName().endsWith("#" + methodName)) {
                propertySym = sym;
                break;
            }
        }
    } else {
        propertySym = classType.getProperty(methodName);
    }

    let methodNode: Node | undefined;
    if (!propertySym) {
        // if no property symbol is found, try to find the method declaration
        methodNode = globalContext.services.esTreeNodeToTSNodeMap.get(esMethodDecl);
    } else {
        methodNode = propertySym.valueDeclaration;
    }

    if (!methodNode) throw new Error("Method node not found");
    let methodType = propertySym ? tc.getTypeOfSymbolAtLocation(propertySym, methodNode) : tc.getTypeAtLocation(methodNode);
    if (esMethodDecl.optional && methodType.isUnion()) {
        methodType = methodType.types[1];
    }
    const methodSignature = tc.getSignaturesOfType(methodType, SignatureKind.Call)[0];
    if (methodSignature === undefined) {
        if (esMethodDecl.kind === "constructor") {
            // constructor
            const parameters: LCETypeFunctionParameter[] = [];
            for (let i = 0; i < esMethodDecl.value.params.length; i++) {
                let esParam = esMethodDecl.value.params[i];
                if (esParam.type == "TSParameterProperty") {
                    esParam = esParam.parameter;
                }
                const paramNode = globalContext.services.esTreeNodeToTSNodeMap.get(esParam);
                const paramType = tc.getTypeAtLocation(paramNode);
                parameters.push(
                    new LCETypeFunctionParameter(
                        i,
                        (esParam as Identifier).name,
                        esParam.optional ?? false,
                        parseType(processingContext, paramType, paramNode)
                    )
                );
            }
            return new LCETypeFunction(new LCETypeNotIdentified("constructor"), parameters, []);
        } else if (esMethodDecl.kind === "get") {
            // getter
            return new LCETypeFunction(parseType(processingContext, methodType, methodNode), [], []);
        } else if (esMethodDecl.kind === "set") {
            // setter
            const param = "value" in esMethodDecl ? esMethodDecl.value.params[0] : esMethodDecl.params[0];
            const paramName = (param as Identifier).name;
            const esParam = param;
            const paramNode = globalContext.services.esTreeNodeToTSNodeMap.get(esParam);
            const paramType = tc.getTypeAtLocation(paramNode);
            return new LCETypeFunction(
                new LCETypeNotIdentified("setter"),
                [new LCETypeFunctionParameter(0, paramName, false, parseType(processingContext, paramType, methodNode))],
                []
            );
        }
    }

    // parse return type
    const returnType = parseType(processingContext, methodSignature.getReturnType(), methodNode);

    // parse type parameters
    const typeParameters = parseFunctionTypeParameters(processingContext, methodSignature, methodNode);

    // parse parameters
    const parameters = parseFunctionParameters(processingContext, methodSignature, methodNode);

    return new LCETypeFunction(returnType, parameters, typeParameters);
}

/**
 * Returns the function type for a given function declaration
 */
export function parseFunctionType(
    processingContext: ProcessingContext,
    esFunctionDecl: FunctionDeclaration | TSDeclareFunction | FunctionExpression | ArrowFunctionExpression
): LCETypeFunction {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;
    const methodNode = globalContext.services.esTreeNodeToTSNodeMap.get(esFunctionDecl);
    const methodType = tc.getTypeAtLocation(methodNode);
    const methodSignature = tc.getSignaturesOfType(methodType, SignatureKind.Call)[0];

    // parse return type
    const returnType = parseType(processingContext, methodSignature.getReturnType(), methodNode);

    // parse type parameters
    const typeParameters = parseFunctionTypeParameters(processingContext, methodSignature, methodNode);

    // parse parameters
    const parameters = parseFunctionParameters(processingContext, methodSignature, methodNode);

    return new LCETypeFunction(returnType, parameters, typeParameters);
}

/**
 * Returns the type parameters declared for a given class or interface
 * @param esElement declaration node provided in ESTree
 * @returns Array of LCEGenericsTypeVariable with encoded type parameter information
 */
export function parseClassLikeTypeParameters(
    processingContext: ProcessingContext,
    esElement: ClassDeclaration | TSInterfaceDeclaration
): LCETypeParameterDeclaration[] {
    const globalContext = processingContext.globalContext;
    const node = globalContext.services.esTreeNodeToTSNodeMap.get(esElement);
    const type = globalContext.typeChecker.getTypeAtLocation(node);
    const tc = globalContext.typeChecker;
    const result: LCETypeParameterDeclaration[] = [];
    for (let i = 0; i < tc.getTypeArguments(type as TypeReference).length; i++){
        const typeParam = tc.getTypeArguments(type as TypeReference)[i];
        const name = typeParam.symbol.name;
        let constraintType: LCEType;

        if (!typeParam.symbol.declarations) throw new Error("Type parameter symbol has no declarations");

        const typeParamDecl = typeParam.symbol.declarations[0];
        if (isTypeParameterDeclaration(typeParamDecl) && typeParamDecl.constraint) {
            constraintType = parseType(processingContext, tc.getTypeAtLocation(typeParamDecl.constraint), typeParamDecl);
        } else {
            // if no constraint is found, return empty object type (unconstrained)
            constraintType = new LCETypeObject(new Map());
        }

        result.push(new LCETypeParameterDeclaration(name, i, constraintType));
    }

    return result;
}

/**
 * Returns the type parameters declared for a given type alias
 * @param esElement declaration node provided in ESTree
 * @returns Array of LCEGenericsTypeVariable with encoded type parameter information
 */
export function parseTypeAliasTypeParameters(processingContext: ProcessingContext, esElement: TSTypeAliasDeclaration): LCETypeParameterDeclaration[] {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;
    const result: LCETypeParameterDeclaration[] = [];

    const esTypeParameters = esElement.typeParameters?.params ?? [];
    for (let i = 0; i < esTypeParameters.length; i++){
        const esTypeParam = esTypeParameters[i];
        const typeParam = tc.getTypeAtLocation(globalContext.services.esTreeNodeToTSNodeMap.get(esTypeParam));
        const name = typeParam.symbol.name;
        let constraintType: LCEType;

        if (!typeParam.symbol.declarations) throw new Error("Type parameter symbol has no declarations");

        const typeParamDecl = typeParam.symbol.declarations[0];
        if (isTypeParameterDeclaration(typeParamDecl) && typeParamDecl.constraint) {
            constraintType = parseType(processingContext, tc.getTypeAtLocation(typeParamDecl.constraint), typeParamDecl);
        } else {
            // if no constraint is found, return empty object type (unconstrained)
            constraintType = new LCETypeObject(new Map());
        }

        result.push(new LCETypeParameterDeclaration(name, i, constraintType));
    }

    return result;
}

/**
 * Returns declared type for a given super type specified after `extends` or `implements`
 * @param esTypeIdentifier ESTree identifier of the super type
 * @param esTypeArguments type arguments of the super type
 * @returns
 */
export function parseClassLikeBaseType(
    processingContext: ProcessingContext,
    esTypeIdentifier: Identifier | TSClassImplements | TSInterfaceHeritage,
    esTypeArguments?: TypeNode[]
): LCETypeDeclared | undefined {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;
    const node = globalContext.services.esTreeNodeToTSNodeMap.get(esTypeIdentifier);
    const type = tc.getTypeAtLocation(node);
    const result = parseType(processingContext, type, node);

    if (result instanceof LCETypeDeclared) {
        const typeArgs: LCEType[] = [];
        for (const esTypeArgument of esTypeArguments ?? []) {
            const node = globalContext.services.esTreeNodeToTSNodeMap.get(esTypeArgument);
            const type = tc.getTypeAtLocation(node);
            typeArgs.push(parseType(processingContext, type, node));
        }
        result.typeArguments = typeArgs;
        return result;
    } else {
        return undefined;
    }
}

export function parseESNodeType(processingContext: ProcessingContext, esNode: ESNode, excludedFQN?: string, ignoreDependencies = false): LCEType {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;
    const node = globalContext.services.esTreeNodeToTSNodeMap.get(esNode);
    const type = tc.getTypeAtLocation(node);
    const result = parseType(processingContext, type, node, excludedFQN, ignoreDependencies);
    return result;
}

function parseType(processingContext: ProcessingContext, type: Type, node: Node, excludedFQN?: string, ignoreDependencies = false): LCEType {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;

    const symbol = type.aliasSymbol ? type.aliasSymbol : type.symbol ? type.symbol : undefined;
    const fqn = symbol ? tc.getFullyQualifiedName(symbol) : undefined;

    if ((!fqn || fqn === "(Anonymous function)" || fqn.startsWith("__type") || fqn === excludedFQN) && !isPrimitiveType(tc.typeToString(type))) {
        // TODO: handle recursive types like `_DeepPartialObject`
        if (type.aliasSymbol?.getName() === "_DeepPartialObject") return new LCETypeNotIdentified("DeepPartialObject is not supported");

        // anonymous type
        return parseAnonymousType(processingContext, type, node, symbol, excludedFQN, ignoreDependencies);
    }

    if (type.isTypeParameter()) {
        // type parameter (generics)
        return new LCETypeParameterReference(type.symbol.name);
    }

    const primitive = !fqn;

    if (primitive) {
        // primitive type
        return new LCETypePrimitive(tc.typeToString(type));
    } else {
        // declared type

        // normalize TypeChecker FQN and determine if type is part of the project
        // TODO: further testing needed
        const sourceFile = symbol?.valueDeclaration?.getSourceFile() ?? symbol?.declarations?.find((d) => !!d.getSourceFile())?.getSourceFile();
        const isStandardLibrary = !!sourceFile && globalContext.services.program.isSourceFileDefaultLibrary(sourceFile);
        const isExternal = !!sourceFile && globalContext.services.program.isSourceFileFromExternalLibrary(sourceFile);
        // const isExternal = hasSource ? globalContext.services.program.isSourceFileFromExternalLibrary(sourceFile!) :
        //     !!symbol?.declarations && symbol.declarations[0] && globalContext.services.program.isSourceFileFromExternalLibrary(symbol.declarations[0].getSourceFile());

        let normalizedFQN = "";
        let scheduleFqnResolution = false;
        if (isStandardLibrary) {
            // Standard Library fqn (e.g. 'Array') -> keep name
            normalizedFQN = fqn;
        } else if (isExternal) {
            // Node fqn -> set node path in quotes
            if (fqn.includes(".")) {
                // node reference (e.g. "path.ParsedPath") -> set node path in quotes
                normalizedFQN = PathUtils.toFQN(fqn.slice(0, fqn.lastIndexOf("."))) + fqn.slice(fqn.lastIndexOf("."));
            } else {
                normalizedFQN = PathUtils.toFQN(fqn);
            }
        } else if (fqn.startsWith('"')) {
            // FQN with specified module path (e.g. '"/home/../src/MyModule".MyClass') -> normalize module path
            normalizedFQN = PathUtils.normalizeTypeCheckerFQN(globalContext.projectRootPath, fqn, globalContext.sourceFilePath);
        } else {
            // internal name (e.g. "InternalClass") -> resolve later
            normalizedFQN = fqn;
            scheduleFqnResolution = true;
        }

        if (normalizedFQN === excludedFQN) {
            // if declared type would reference excluded fqn (e.g. variable name), treat as anonymous type
            return parseAnonymousType(processingContext, type, node, symbol, excludedFQN, ignoreDependencies);
        }

        const typeArguments: LCEType[] = tc
            .getTypeArguments(type as TypeReference)
            .map((t) => parseType(processingContext, t, node, excludedFQN, ignoreDependencies));

        // TODO: handle locally defined (non-)anonymous types (e.g. with class expressios)

        if (!ignoreDependencies && !isStandardLibrary)
            DependencyResolutionProcessor.registerDependency(processingContext.localContexts, normalizedFQN, scheduleFqnResolution);

        const result = new LCETypeDeclared(normalizedFQN, typeArguments);
        if (scheduleFqnResolution) {
            DependencyResolutionProcessor.scheduleFqnResolution(processingContext.localContexts, fqn, result);
        }
        return result;
    }
}

function parseAnonymousType(
    processingContext: ProcessingContext,
    type: Type,
    node: Node,
    symbol?: Symbol,
    excludedFQN?: string,
    ignoreDependencies = false
): LCEType {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;

    // complex anonymous type
    if (type.isUnion()) {
        // union type
        return new LCETypeUnion(type.types.map((t) => parseType(processingContext, t, node, excludedFQN, ignoreDependencies)));
    } else if (type.isIntersection()) {
        // intersection type
        return new LCETypeIntersection(type.types.map((t) => parseType(processingContext, t, node, excludedFQN, ignoreDependencies)));
    } else if (type.getCallSignatures().length > 0) {
        if (type.getCallSignatures().length > 1) return new LCETypeNotIdentified(tc.typeToString(type));
        // function type
        const signature = type.getCallSignatures()[0];
        const returnType = parseType(processingContext, tc.getReturnTypeOfSignature(signature), node, excludedFQN, ignoreDependencies);
        const parameters: LCETypeFunctionParameter[] = [];
        const paramSyms = signature.getParameters();
        for (let i = 0; i < paramSyms.length; i++) {
            const parameterSym = paramSyms[i];
            const paramType = tc.getTypeOfSymbolAtLocation(parameterSym, node);
            const paramNode = parameterSym.getDeclarations();
            const optional = paramNode ? tc.isOptionalParameter(paramNode[0] as ParameterDeclaration) : false;
            parameters.push(
                new LCETypeFunctionParameter(
                    i,
                    parameterSym.name,
                    optional,
                    parseType(processingContext, paramType, node, excludedFQN, ignoreDependencies)
                )
            );
        }
        const typeParameters = parseFunctionTypeParameters(processingContext, signature, node);
        return new LCETypeFunction(returnType, parameters, typeParameters);
    } else if (type.symbol?.members) {
        // anonymous object type
        // TODO: test for methods, callables, index signatures, etc.
        const members: Map<string, LCEType> = new Map();
        for (const prop of type.getProperties()) {
            const propType = tc.getTypeOfSymbolAtLocation(prop, node);
            members.set(prop.name, parseType(processingContext, propType, node, excludedFQN, ignoreDependencies));
        }
        return new LCETypeObject(members);
    } else if (type.isLiteral()) {
        // literal type
        if (isLiteralNumberOrString(type.value)) return new LCETypeLiteral(type.value);
        else return new LCETypeLiteral(type.value.toString());
    } else if (tc.typeToString(type) === "true") {
        // boolean true literal
        return new LCETypeLiteral(true);
    } else if (tc.typeToString(type) === "false") {
        // boolean false literal
        return new LCETypeLiteral(false);
    } else if (tc.typeToString(type).startsWith("[")) {
        // tuple type
        const typeArgs = tc.getTypeArguments(type as TypeReference);
        const types: LCEType[] = [];
        for (const typeArg of typeArgs) {
            types.push(parseType(processingContext, typeArg, node, excludedFQN, ignoreDependencies));
        }
        return new LCETypeTuple(types);
    }

    // TODO: Detect Callable Types
    // TODO: Detect Index Types

    // if nothing matches return placeholder
    return new LCETypeNotIdentified(tc.typeToString(type));
}

function isPrimitiveType(typeStr: string): boolean {
    return ["undefined", "null", "void", "any", "unknown", "never", "number", "bigint", "boolean", "string", "symbol", "object"].includes(typeStr);
}

function isLiteralNumberOrString(literalValue: number | string | PseudoBigInt): literalValue is number | string {
    return typeof literalValue === "string" || typeof literalValue === "number";
}

function parseFunctionTypeParameters(processingContext: ProcessingContext, signature: Signature, node: Node): LCETypeParameterDeclaration[] {
    const result: LCETypeParameterDeclaration[] = [];
    const typeParameters = signature.getTypeParameters();
    if (typeParameters) {
        for (let i = 0; i < typeParameters.length; i++){
            const typeParam = typeParameters[i];
            const name = typeParam.symbol.name;
            let constraintType: LCEType;

            const constraint = typeParam.getConstraint();
            if (constraint) {
                constraintType = parseType(processingContext, constraint, node);
            } else {
                // if no constraint is found, return empty object type (unconstrained)
                constraintType = new LCETypeObject(new Map());
            }

            result.push(new LCETypeParameterDeclaration(name, i, constraintType));
        }
    }

    return result;
}

function parseFunctionParameters(processingContext: ProcessingContext, signature: Signature, node: Node): LCETypeFunctionParameter[] {
    const globalContext = processingContext.globalContext;
    const tc = globalContext.typeChecker;
    const parameters: LCETypeFunctionParameter[] = [];
    const parameterSyms = signature.getParameters();
    for (let i = 0; i < parameterSyms.length; i++) {
        const paraSym = parameterSyms[i];
        const parameterType = tc.getTypeOfSymbolAtLocation(paraSym, node);
        // const esParam = esMethodDecl.value.params[i];
        // TODO: process parameter destructuring (arrays and objects)
        // TODO: process rest parameter arguments
        // TODO: process `this` parameter (necessary?)
        // TODO: process default parameters
        const paramNode = paraSym.getDeclarations();
        const optional = paramNode ? tc.isOptionalParameter(paramNode[0] as ParameterDeclaration) : false;
        parameters.push(new LCETypeFunctionParameter(i, paraSym.name, optional, parseType(processingContext, parameterType, node)));
    }
    return parameters;
}
