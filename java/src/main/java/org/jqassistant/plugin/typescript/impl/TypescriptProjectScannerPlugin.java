package org.jqassistant.plugin.typescript.impl;

import com.buschmais.jqassistant.core.scanner.api.Scanner;
import com.buschmais.jqassistant.core.scanner.api.ScannerPlugin;
import com.buschmais.jqassistant.core.scanner.api.Scope;
import com.buschmais.jqassistant.plugin.common.api.scanner.AbstractScannerPlugin;
import com.buschmais.jqassistant.plugin.common.api.scanner.filesystem.FileResource;
import com.buschmais.jqassistant.plugin.json.api.model.JSONFileDescriptor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jqassistant.plugin.typescript.api.TypescriptScope;
import org.jqassistant.plugin.typescript.api.model.core.TypeScriptScanDescriptor;
import org.jqassistant.plugin.typescript.impl.mapper.core.TypeScriptScanMapper;
import org.jqassistant.plugin.typescript.impl.model.core.Project;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@ScannerPlugin.Requires(JSONFileDescriptor.class)
public class TypescriptProjectScannerPlugin extends AbstractScannerPlugin<FileResource, TypeScriptScanDescriptor> {

    private ObjectMapper objectMapper;

    @Override
    public void initialize() {
        this.objectMapper = new ObjectMapper();

        // TODO: remove config option
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Override
    public boolean accepts(FileResource fileResource, String path, Scope scope) {
        return TypescriptScope.PROJECT.equals(scope) && path.endsWith(".json");
    }

    @Override
    public TypeScriptScanDescriptor scan(FileResource fileResource, String path, Scope scope, Scanner scanner) throws IOException {
        var reader = objectMapper.readerFor(Project.class);
        var parser = reader.createParser(fileResource.createStream());
        List<Project> projects = Arrays.asList(reader.readValue(parser, Project[].class));
        return TypeScriptScanMapper.INSTANCE.map(projects, scanner);
    }
}
