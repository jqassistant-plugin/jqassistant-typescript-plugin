import { ExtractorOptions, processProjects } from "../../../src/core/extractor";
import { LCETypeAliasDeclaration } from "../../../src/core/concepts/type-alias-declaration.concept";
import { LCEType, LCETypeNotIdentified } from "../../../src/core/concepts/type.concept";
import {
    expectFunctionType,
    expectObjectType,
    expectObjectTypeMember,
    expectPrimitiveType,
    expectTypeParameterDeclaration,
    resolveGlobalFqn,
} from "../../utils/test-utils";

jest.setTimeout(30000);

describe("type resolution depth test", () => {
    const projectRootPath = "./test/core/integration/sample-projects/type-resolution-depth";
    let defaultDepthDecls: Map<string, LCETypeAliasDeclaration>;
    let depth2Decls: Map<string, LCETypeAliasDeclaration>;
    let depth0Decls: Map<string, LCETypeAliasDeclaration>;

    async function extractTypeAliasDeclarations(options?: ExtractorOptions): Promise<Map<string, LCETypeAliasDeclaration>> {
        const projects = await processProjects(projectRootPath, options);
        if (projects.length !== 1) {
            throw new Error("Processed " + projects.length + " projects. Should be 1 instead.");
        }

        const taDecls: Map<string, LCETypeAliasDeclaration> = new Map();
        for (const concept of projects[0].concepts.get(LCETypeAliasDeclaration.conceptId) ?? []) {
            const taDecl = concept as LCETypeAliasDeclaration;
            taDecls.set(taDecl.fqn.globalFqn, taDecl);
        }
        return taDecls;
    }

    function getTypeAliasType(taDecls: Map<string, LCETypeAliasDeclaration>, name: string): LCEType {
        const decl = taDecls.get(resolveGlobalFqn(projectRootPath, `"./src/main.ts".${name}`));
        expect(decl).toBeDefined();
        return decl!.type;
    }

    /**
     * Expects the provided type to be an object type with a single member of the given name and returns the type of that member.
     */
    function getSingleMemberType(type: LCEType | undefined, name: string): LCEType {
        return expectObjectTypeMember(expectObjectType(type, 1), name).type;
    }

    beforeAll(async () => {
        defaultDepthDecls = await extractTypeAliasDeclarations();
        depth2Decls = await extractTypeAliasDeclarations({ maxTypeResolutionDepth: 2 });
        depth0Decls = await extractTypeAliasDeclarations({ maxTypeResolutionDepth: 0 });
    });

    test("default depth resolves nested types up to depth 10", async () => {
        let type = getTypeAliasType(defaultDepthDecls, "tDeeplyNested");
        for (let depth = 1; depth <= 10; depth++) {
            type = getSingleMemberType(type, "l" + depth);
        }
        expect(getSingleMemberType(type, "l11")).toEqual(LCETypeNotIdentified.RESOLUTION_LIMIT);
    });

    test("configured depth resolves nested types up to that depth", async () => {
        const l2Type = getSingleMemberType(getSingleMemberType(getTypeAliasType(depth2Decls, "tDeeplyNested"), "l1"), "l2");
        expect(getSingleMemberType(l2Type, "l3")).toEqual(LCETypeNotIdentified.RESOLUTION_LIMIT);
    });

    test("depth 0 resolves only the outermost type", async () => {
        expect(getSingleMemberType(getTypeAliasType(depth0Decls, "tDeeplyNested"), "l1")).toEqual(LCETypeNotIdentified.RESOLUTION_LIMIT);
    });

    test("depth is passed on to type parameter constraints of nested function types", async () => {
        const defaultFunType = expectFunctionType(
            getSingleMemberType(getTypeAliasType(defaultDepthDecls, "tGenericFunctionMember"), "fun"),
            1,
            "void",
            false,
        );
        expectTypeParameterDeclaration(defaultFunType.typeParameters, 0, "T", false);
        expectPrimitiveType(getSingleMemberType(defaultFunType.typeParameters[0].constraint, "l3"), "string");

        const depth2FunType = expectFunctionType(
            getSingleMemberType(getTypeAliasType(depth2Decls, "tGenericFunctionMember"), "fun"),
            1,
            "void",
            false,
        );
        expectTypeParameterDeclaration(depth2FunType.typeParameters, 0, "T", false);
        expect(getSingleMemberType(depth2FunType.typeParameters[0].constraint, "l3")).toEqual(LCETypeNotIdentified.RESOLUTION_LIMIT);
    });
});
