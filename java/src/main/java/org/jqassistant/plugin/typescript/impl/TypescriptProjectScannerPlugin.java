package org.jqassistant.plugin.typescript.impl;

import java.io.IOException;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerPlugin;
import com.buschmais.jqassistant.core.scanner.api.Scope;
import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.AbstractScannerPlugin;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import com.buschmais.jqassistant.plugin.common.api.scanner.filesystem.FileResource;
import com.buschmais.jqassistant.plugin.json.api.model.JSONFileDescriptor;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.ModuleDescriptor;
import org.jqassistant.plugin.typescript.api.model.ProjectDescriptor;
import org.jqassistant.plugin.typescript.impl.model.Module;
import org.jqassistant.plugin.typescript.impl.model.ScanResultCollection;
import org.jqassistant.plugin.typescript.impl.ts.ModuleMapper;
import org.jqassistant.plugin.typescript.impl.ts.ProjectMapper;

@ScannerPlugin.Requires(JSONFileDescriptor.class)
public class TypescriptProjectScannerPlugin extends AbstractScannerPlugin<FileResource, ProjectDescriptor> {

    private ObjectMapper objectMapper;

    @Override
    public void initialize() {
        this.objectMapper = new ObjectMapper();

        // TODO: remove config option
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Override
    public boolean accepts(FileResource fileResource, String path, Scope scope) throws IOException {
        return TypescriptScope.PROJECT.equals(scope) && path.endsWith(".json");
    }

    @Override
    public ProjectDescriptor scan(FileResource fileResource, String path, Scope scope, Scanner scanner) throws IOException {
        ScanResultCollection scanResultCollection = objectMapper.readValue(fileResource.createStream(), ScanResultCollection.class);
        return ProjectMapper.INSTANCE.map(scanResultCollection, scanner);
    }
}
