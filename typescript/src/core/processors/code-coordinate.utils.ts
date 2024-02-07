import { GlobalContext } from "../context";
import { CodeCoordinates } from "../concepts/code-coordinate.concept";
import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import { ModulePathUtils } from "../utils/modulepath.utils";

export class CodeCoordinateUtils {
    static getCodeCoordinates(globalContext: GlobalContext, node: Node, saveFilePath: boolean = false): CodeCoordinates {
        const sourceFile = globalContext.services.program.getSourceFile(globalContext.sourceFilePathAbsolute);

        const start = sourceFile?.getLineAndCharacterOfPosition(node.range[0]);
        const end = sourceFile?.getLineAndCharacterOfPosition(node.range[1]);

        return new CodeCoordinates(
            saveFilePath ? ModulePathUtils.toGraphPath(globalContext.sourceFilePathAbsolute) : undefined,
            start ? start.line + 1 : undefined,
            start ? start.character : undefined,
            end ? end.line + 1 : undefined,
            end ? end.character : undefined,
        );
    }
}

