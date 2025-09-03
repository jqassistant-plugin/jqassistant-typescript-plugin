import { PostProcessor } from "../../core/post-processor";
import { LCEReactComponent } from "../concepts/react-component.concept";
import { LCEFunctionDeclaration } from "../../core/concepts/function-declaration.concept";
import { LCEVariableDeclaration } from "../../core/concepts/variable-declaration.concept";
import { LCEClassDeclaration } from "../../core/concepts/class-declaration.concept";
import { LCEType, LCETypeDeclared, LCETypeFunction, LCETypeUnion } from "../../core/concepts/type.concept";
import { JSXDependencyContextProcessor } from "../processors/jsx-dependency.processor";
import { LCEProject } from "../../core/project";

export class ReactComponentPostProcessor extends PostProcessor {
    override postProcess(projects: LCEProject[]): void {
        for (const project of projects) {
            const concepts = project.concepts;
            const reactComponents: LCEReactComponent[] = [];

            // Function Components (standard functions)
            const allFunctions: LCEFunctionDeclaration[] = (concepts.get(LCEFunctionDeclaration.conceptId) ?? []) as LCEFunctionDeclaration[];
            for (const func of allFunctions) {
                if (this.isComponentReturnType(func.returnType)) {
                    const component = new LCEReactComponent(func.fqn, func.functionName, []);
                    if (func.metadata.has(JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA)) {
                        component.renderedElements.push(...func.metadata.get(JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA));
                    }
                    reactComponents.push(component);
                }
            }

            // Function Components (function expression)
            const allVariables: LCEVariableDeclaration[] = (concepts.get(LCEVariableDeclaration.conceptId) ?? []) as LCEVariableDeclaration[];
            for (const variable of allVariables) {
                if (
                    (variable.type instanceof LCETypeFunction && this.isComponentReturnType(variable.type.returnType)) ||
                    (variable.type instanceof LCETypeDeclared && this.isReactFunctionComponentType(variable.type.fqn.globalFqn))
                ) {
                    const component = new LCEReactComponent(variable.fqn, variable.variableName, []);
                    if (variable.metadata.has(JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA)) {
                        component.renderedElements.push(...variable.metadata.get(JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA));
                    }
                    reactComponents.push(component);
                }
            }

            // Class Components
            const allClasses: LCEClassDeclaration[] = (concepts.get(LCEClassDeclaration.conceptId) ?? []) as LCEClassDeclaration[];
            for (const clss of allClasses) {
                if (clss.extendsClass && clss.extendsClass.fqn.globalFqn === '"react".React.Component') {
                    const component = new LCEReactComponent(clss.fqn, clss.className, []);
                    if (clss.metadata.has(JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA)) {
                        component.renderedElements.push(...clss.metadata.get(JSXDependencyContextProcessor.JSX_DEPENDENCY_METADATA));
                    }
                    reactComponents.push(component);
                }
            }

            concepts.set(LCEReactComponent.conceptId, [...reactComponents.values()]);
        }
    }

    /**
     * returns whether the provided fqn is a return type that indicates that a function is a React component
     */
    isComponentReturnType(type: LCEType): boolean {
        const validTypeFqns = [
            '"react".React.ReactNode',
            '"react".React.ReactElement',
            '"react".React.ReactPortal',
            '"react".React.JSX.Element',
            '"react".JSX.Element',
        ];

        if (type instanceof LCETypeDeclared) {
            return validTypeFqns.includes(type.fqn.globalFqn);
        } else if (type instanceof LCETypeUnion) {
            return !!type.types.find((t) => t instanceof LCETypeDeclared && validTypeFqns.includes(t.fqn.globalFqn));
        } else {
            return false;
        }
    }

    /**
     * returns whether the provided fqn belongs to an interface/type describing a React function component
     */
    isReactFunctionComponentType(globalFqn: string): boolean {
        return [
            '"react".React.FC',
            '"react".React.ExoticComponent',
            '"react".React.NamedExoticComponent',
            '"react".React.ForwardRefExoticComponent',
            '"react".React.MemoExoticComponent',
        ].includes(globalFqn);
    }
}
