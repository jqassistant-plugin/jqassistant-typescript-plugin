import { GlobalContext } from "../context";
import { CodeCoordinates } from "../concepts/code-coordinate.concept";
import { Node } from "@typescript-eslint/types/dist/generated/ast-spec";
import * as path from "path";
import { PathUtils } from "../utils/path.utils";

export class CodeCoordinateUtils {
    static getCodeCoordinates(globalContext: GlobalContext, node: Node, saveFilePath: boolean = false): CodeCoordinates {
        const sourceFile = globalContext.services.program.getSourceFile(path.resolve(globalContext.projectRootPath, globalContext.sourceFilePath));

        const start = sourceFile?.getLineAndCharacterOfPosition(node.range[0]);
        const end = sourceFile?.getLineAndCharacterOfPosition(node.range[1]);

        return new CodeCoordinates(
            saveFilePath ? PathUtils.toGraphPath(globalContext.sourceFilePath) : undefined,
            start ? start.line + 1 : undefined,
            start ? start.character : undefined,
            end ? end.line + 1 : undefined,
            end ? end.character : undefined,
        );
    }
}

