/* eslint-disable @typescript-eslint/ban-types */
import {
    ArrowFunctionExpression,
    ClassDeclaration,
    ClassPropertyNameNonComputed,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    MemberExpression,
    MethodDefinitionNonComputedName,
    Node as ESNode,
    TSAbstractMethodDefinitionNonComputedName,
    TSClassImplements,
    TSDeclareFunction,
    TSInterfaceDeclaration,
    TSInterfaceHeritage,
    TSMethodSignatureNonComputedName,
    TSTypeAliasDeclaration,
    TypeNode
} from "@typescript-eslint/types/dist/generated/ast-spec";
import ts, {
    isTypeParameterDeclaration,
    Node,
    ObjectType,
    ParameterDeclaration,
    PropertySignature,
    PseudoBigInt,
    Signature,
    SignatureKind,
    Symbol,
    Type,
    TypeReference
} from "typescript";

import { LCETypeParameterDeclaration } from "../concepts/type-parameter.concept";
import {
    LCEType,
    LCETypeDeclared,
    LCETypeFunction,
    LCETypeFunctionParameter,
    LCETypeIntersection,
    LCETypeLiteral,
    LCETypeNotIdentified,
    LCETypeObject,
    LCETypeObjectMember,
    LCETypeParameterReference,
    LCETypePrimitive,
    LCETypeTuple,
    LCETypeUnion
} from "../concepts/type.concept";
import { FQN, ProcessingContext } from "../context";
import { ModulePathUtils } from "../utils/modulepath.utils";
import { DependencyResolutionProcessor } from "./dependency-resolution.processor";
import { NodeUtils } from "../utils/node.utils";
import path from "path";

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
 * @param esMethodDecl method name node provided in ESTree
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
            return new LCETypeFunction(new LCETypeNotIdentified("constructor"), parameters, false, []);
        } else if (esMethodDecl.kind === "get") {
            // getter
            return new LCETypeFunction(parseType(processingContext, methodType, methodNode), [], false, []);
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
                false,
                []
            );
        }
    }

    // parse return type
    const returnType = parseType(processingContext, methodSignature.getReturnType(), methodNode);

    // parse parameters
    const parameters = parseFunctionParameters(processingContext, methodSignature, methodNode);

    // determine if method is async
    let async = false;
    if("modifiers" in methodNode) {
        async = !!(methodNode.modifiers as {kind: number}[])?.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);
    }

    // parse type parameters
    const typeParameters = parseFunctionTypeParameters(processingContext, methodSignature, methodNode);

    return new LCETypeFunction(returnType, parameters, async, typeParameters);
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
    const functionNode = globalContext.services.esTreeNodeToTSNodeMap.get(esFunctionDecl);
    const functionType = tc.getTypeAtLocation(functionNode);
    const functionSignature = tc.getSignaturesOfType(functionType, SignatureKind.Call)[0];

    // parse return type
    const returnType = parseType(processingContext, functionSignature.getReturnType(), functionNode);

    // parse type parameters
    const typeParameters = parseFunctionTypeParameters(processingContext, functionSignature, functionNode);

    // parse parameters
    const parameters = parseFunctionParameters(processingContext, functionSignature, functionNode);

    const async = !!functionNode.modifiers?.find(m => m.kind === ts.SyntaxKind.AsyncKeyword);

    return new LCETypeFunction(returnType, parameters, async, typeParameters);
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
            constraintType = new LCETypeObject([]);
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
            constraintType = new LCETypeObject([]);
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
    esTypeIdentifier: MemberExpression | Identifier | TSClassImplements | TSInterfaceHeritage,
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
    try {
        let symbol: ts.Symbol | undefined;
        let globalFqn: string | undefined;
        if (type.aliasSymbol && (!excludedFQN || !tc.getFullyQualifiedName(type.aliasSymbol).endsWith(excludedFQN))) {
            symbol = type.aliasSymbol;
        } else {
            if (type.symbol) {
                symbol = type.symbol;
            } else {
                symbol = undefined;
            }
        }
        if(!globalFqn) {
            if(symbol && (symbol.flags & ts.SymbolFlags.EnumMember) && "parent" in symbol) {
                // Normalize enum member symbols to avoid enum member declared types
                symbol = symbol.parent as Symbol;
            }
            globalFqn = symbol ? tc.getFullyQualifiedName(symbol) : undefined;
        }

        if (
            (
                !globalFqn ||
                globalFqn === "(Anonymous function)" ||
                globalFqn.startsWith("__type") ||
                globalFqn.startsWith("__object") ||
                globalFqn === excludedFQN ||
                (symbol && symbol.getEscapedName().toString().startsWith("__object"))
            ) &&
            !isPrimitiveType(tc.typeToString(type))
        ) {
            // TODO: handle recursive types like `_DeepPartialObject`
            if (type.aliasSymbol?.getName() === "_DeepPartialObject") {
                return new LCETypeNotIdentified("DeepPartialObject is not supported");
            }

            // anonymous type
            return parseAnonymousType(processingContext, type, node, symbol, excludedFQN, ignoreDependencies);
        }

        if (type.isTypeParameter()) {
            // type parameter (generics)
            return new LCETypeParameterReference(type.symbol.name);
        }

        const primitive = !globalFqn;

        if (primitive) {
            // primitive type
            return new LCETypePrimitive(tc.typeToString(type));
        } else {
            globalFqn = globalFqn!;
            // declared type

            // normalize TypeChecker FQN and determine if type is part of the project
            const sourceFile = symbol?.valueDeclaration?.getSourceFile() ?? symbol?.declarations?.find((d) => !!d.getSourceFile())?.getSourceFile();
            const isStandardLibrary = !!sourceFile && globalContext.services.program.isSourceFileDefaultLibrary(sourceFile);
            const relativeSrcPath = !!sourceFile ? path.relative(globalContext.projectInfo.rootPath, sourceFile.fileName).replace(/\\/g, "/") : undefined;
            const isExternal = !!sourceFile && (globalContext.services.program.isSourceFileFromExternalLibrary(sourceFile) || relativeSrcPath!.startsWith("node_modules"));

            let normalizedFqn = new FQN("");
            let scheduleFqnResolution = false;
            if (isStandardLibrary) {
                // Standard Library fqn (e.g. 'Array') -> keep name
                normalizedFqn.globalFqn = globalFqn;
            } else if (isExternal) {
                if (globalFqn.startsWith('"')) {
                    // path that *probably* points to node modules
                    // -> resolve absolute path
                    const packageName = NodeUtils.getPackageNameForPath(globalContext.projectInfo.rootPath, ModulePathUtils.extractFQNPath(globalFqn));
                    if (packageName) {
                        normalizedFqn.globalFqn = `"${packageName}".${ModulePathUtils.extractFQNIdentifier(globalFqn)}`;
                    } else {
                        normalizedFqn.globalFqn = ModulePathUtils.normalizeTypeCheckerFQN(globalFqn, globalContext.sourceFilePathAbsolute);
                    }
                } else {
                    // Node fqn -> set node path in quotes
                    const packageName = NodeUtils.getPackageNameForPath(globalContext.projectInfo.rootPath, sourceFile.fileName);
                    if (packageName) {
                        normalizedFqn.globalFqn = `"${packageName}".${globalFqn}`;
                    } else {
                        normalizedFqn.globalFqn = ModulePathUtils.normalizeTypeCheckerFQN(`"${sourceFile.fileName}".${globalFqn}`, globalContext.sourceFilePathAbsolute);
                    }
                }
            } else if (globalFqn.startsWith('"')) {
                // FQN with specified module path (e.g. '"/home/../src/MyModule".MyClass') -> normalize module path
                normalizedFqn.globalFqn = ModulePathUtils.normalizeTypeCheckerFQN(globalFqn, globalContext.sourceFilePathAbsolute);
            } else {
                // plain name (e.g. "SomeClass")
                normalizedFqn.globalFqn = globalFqn;

                // try to get source node for symbol and extract path
                if (symbol && symbol.declarations && symbol.declarations.length === 1) {
                    const fileName = sourceFile?.fileName;
                    if (fileName) {
                        globalFqn = `"${fileName}".${globalFqn}`;
                        normalizedFqn.globalFqn = ModulePathUtils.normalizeTypeCheckerFQN(globalFqn, globalContext.sourceFilePathAbsolute);
                    } else {
                        // could not resolve via parent node -> try to resolve later
                        scheduleFqnResolution = true;
                    }
                } else {
                    // could not resolve via parent node -> try to resolve later
                    scheduleFqnResolution = true;
                }
            }

            if (normalizedFqn.globalFqn === excludedFQN) {
                // if declared type would reference excluded fqn (e.g. variable name), treat as anonymous type
                return parseAnonymousType(processingContext, type, node, symbol, excludedFQN, ignoreDependencies);
            }

            const typeArguments: LCEType[] = [];
            for (let i = 0; i < tc.getTypeArguments(type as TypeReference).length; i++) {
                const ta = tc.getTypeArguments(type as TypeReference)[i];
                if ("typeArguments" in node && node.typeArguments) {
                    // if type argument child node is available, pass it on
                    typeArguments.push(parseType(processingContext, ta, (node.typeArguments as Node[]).at(i) ?? node, excludedFQN, ignoreDependencies))
                } else {
                    typeArguments.push(parseType(processingContext, ta, node, excludedFQN, ignoreDependencies));
                }
            }

            // TODO: handle locally defined (non-)anonymous types (e.g. with class expressions)

            if (!ignoreDependencies && !isStandardLibrary)
                DependencyResolutionProcessor.registerDependency(processingContext.localContexts, normalizedFqn.globalFqn, scheduleFqnResolution);

            const result = new LCETypeDeclared(normalizedFqn, typeArguments);
            if (scheduleFqnResolution) {
                DependencyResolutionProcessor.scheduleFqnResolution(processingContext.localContexts, normalizedFqn.globalFqn, result);
            }
            return result;
        }
    } catch(e) {
        console.error("Error occurred during type resolution:");
        console.error(e);
        return new LCETypeNotIdentified(tc.typeToString(type));
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
        return new LCETypeFunction(returnType, parameters, false, typeParameters);
    } else if (type.symbol?.members) {
        // anonymous object type
        // TODO: test for methods, callables, index signatures, etc.
        const members: LCETypeObjectMember[] = [];
        for (const prop of type.getProperties()) {
            if(prop.valueDeclaration) {
                const propSignature = prop.valueDeclaration as PropertySignature
                const optional = !!propSignature.questionToken;
                const readonly = !!propSignature.modifiers && propSignature.modifiers.some(mod => mod.kind === ts.SyntaxKind.ReadonlyKeyword);

                const propType = tc.getTypeOfSymbolAtLocation(prop, node);
                members.push(new LCETypeObjectMember(
                    prop.name,
                    parseType(processingContext, propType, node, excludedFQN, ignoreDependencies),
                    optional,
                    readonly
                ));
            }
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
    } else if((type.flags & ts.TypeFlags.Object) &&
        ((type as ObjectType).objectFlags & ts.ObjectFlags.Reference) &&
        ((type as TypeReference).target.objectFlags & ts.ObjectFlags.Tuple)) {
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
                constraintType = new LCETypeObject([]);
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
