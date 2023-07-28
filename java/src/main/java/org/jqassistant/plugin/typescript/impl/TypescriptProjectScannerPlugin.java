package org.jqassistant.plugin.typescript.impl;

import java.io.IOException;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerPlugin;
import com.buschmais.jqassistant.core.scanner.api.Scope;
import com.buschmais.jqassistant.plugin.common.api.scanner.AbstractScannerPlugin;
import com.buschmais.jqassistant.plugin.common.api.scanner.filesystem.FileResource;
import com.buschmais.jqassistant.plugin.json.api.model.JSONFileDescriptor;

import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.ProjectDescriptor;

@ScannerPlugin.Requires(JSONFileDescriptor.class)
public class TypescriptProjectScannerPlugin extends AbstractScannerPlugin<FileResource, ProjectDescriptor> {
    @Override
    public boolean accepts(FileResource fileResource, String path, Scope scope) throws IOException {
        return TypescriptScope.PROJECT.equals(scope) && path.endsWith(".json");
    }

    @Override
    public ProjectDescriptor scan(FileResource fileResource, String path, Scope scope, Scanner scanner) throws IOException {
        JSONFileDescriptor jsonFileDescriptor = scanner.getContext()
            .getCurrentDescriptor();
        return scanner.getContext()
            .getStore()
            .addDescriptorType(jsonFileDescriptor, ProjectDescriptor.class);
    }
}
