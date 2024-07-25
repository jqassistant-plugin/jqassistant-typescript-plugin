package org.jqassistant.plugin.typescript.impl.mapper.core;

import org.jqassistant.plugin.typescript.api.model.core.TypeParameterDeclarationDescriptor;

import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

public class TypeParameterResolver {

    private final Stack<Map<String, TypeParameterDeclarationDescriptor>> typeParams = new Stack<>();


    public void pushScope() {
        typeParams.push(new HashMap<>());
    }

    public void popScope() {
        typeParams.pop();
    }

    public void registerParameter(TypeParameterDeclarationDescriptor declaration) {
        typeParams.peek().put(declaration.getName(), declaration);
    }

    public TypeParameterDeclarationDescriptor resolveParameter(String name) {
        for(var paramMap : typeParams) {
            if(paramMap.containsKey(name)) {
                return paramMap.get(name);
            }
        }
        return null;
    }
}
