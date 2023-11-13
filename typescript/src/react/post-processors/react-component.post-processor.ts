import { PostProcessor } from "../../core/post-processor";
import { LCEConcept } from "../../core/concept";
import { LCEReactComponent } from "../concepts/react-component.concept";
import { LCEFunctionDeclaration } from "../../core/concepts/function-declaration.concept";
import { LCEVariableDeclaration } from "../../core/concepts/variable-declaration.concept";
import { LCEClassDeclaration } from "../../core/concepts/class-declaration.concept";
import { LCETypeDeclared, LCETypeFunction } from "../../core/concepts/type.concept";

export class ReactComponentPostProcessor extends PostProcessor {
    postProcess(concepts: Map<string, LCEConcept[]>): void {
        const reactComponents: LCEReactComponent[] = [];

        // Function Components (standard functions)
        const allFunctions: LCEFunctionDeclaration[] = (concepts.get(LCEFunctionDeclaration.conceptId) ?? []) as LCEFunctionDeclaration[];
        for (const func of allFunctions) {
            if (func.returnType instanceof LCETypeDeclared && func.returnType.fqn === '"react".React.JSX.Element') {
                reactComponents.push(new LCEReactComponent(func.fqn, func.functionName, false));
            }
        }

        // Function Components (function expression)
        const allVariables: LCEVariableDeclaration[] = (concepts.get(LCEVariableDeclaration.conceptId) ?? []) as LCEVariableDeclaration[];
        for (const variable of allVariables) {
            if (
                variable.type instanceof LCETypeFunction &&
                variable.type.returnType instanceof LCETypeDeclared &&
                variable.type.returnType.fqn === '"react".React.JSX.Element'
            ) {
                reactComponents.push(new LCEReactComponent(variable.fqn, variable.variableName, false));
            }
        }

        // Class Components
        const allClasses: LCEClassDeclaration[] = (concepts.get(LCEClassDeclaration.conceptId) ?? []) as LCEClassDeclaration[];
        for (const clss of allClasses) {
            if (clss.extendsClass && clss.extendsClass.fqn === '"react".React.Component') {
                reactComponents.push(new LCEReactComponent(clss.fqn, clss.className, true));
            }
        }

        concepts.set(LCEReactComponent.conceptId, [...reactComponents.values()]);
    }
}
