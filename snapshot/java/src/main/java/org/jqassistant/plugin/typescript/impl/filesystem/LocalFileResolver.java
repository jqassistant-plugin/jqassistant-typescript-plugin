package org.jqassistant.plugin.typescript.impl.filesystem;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.core.store.api.Store;
import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;
import com.buschmais.jqassistant.plugin.common.api.scanner.FileResolver;
import com.buschmais.xo.api.Query;

import org.jqassistant.plugin.typescript.api.model.core.LocalFileDescriptor;

import static com.buschmais.jqassistant.core.shared.io.FileNameNormalizer.normalize;

public class LocalFileResolver implements FileResolver {

    private final Path root;

    public LocalFileResolver(Path root) {
        this.root = root.toAbsolutePath();
    }

    @Override
    public <D extends FileDescriptor> D require(String requiredPath, String containedPath, Class<D> type, ScannerContext context) {
        throw new UnsupportedOperationException();
    }

    @Override
    public <D extends FileDescriptor> D require(String requiredPath, Class<D> type, ScannerContext context) {
        return resolve(requiredPath, type, context);
    }

    @Override
    public <D extends FileDescriptor> D match(String containedPath, Class<D> type, ScannerContext context) {
        return resolve(containedPath, type, context);
    }

    private <D extends FileDescriptor> D resolve(String required, Class<D> type, ScannerContext context) {
        Path requiredPath = Paths.get(required)
            .toAbsolutePath();
        D fileDescriptor = getFileDescriptor(requiredPath, type, context);
        resolveHierarchy(requiredPath, fileDescriptor, context);
        return fileDescriptor;
    }

    private <D extends FileDescriptor> void resolveHierarchy(Path currentPath, D fileDescriptor, ScannerContext context) {
        FileDescriptor child = fileDescriptor;
        while ((currentPath = currentPath.getParent()) != null) {
            DirectoryDescriptor parent = getFileDescriptor(currentPath, DirectoryDescriptor.class, context);
            child.getParents()
                .add(parent);
            child = parent;
        }
    }

    private <D extends FileDescriptor> D getFileDescriptor(Path path, Class<D> type, ScannerContext context) {
        Store store = context.getStore();
        LocalFileDescriptor localFileDescriptor = store.<String, LocalFileDescriptor>getCache(LocalFileResolver.class.getName())
            .get(normalize(path.toString()), absoluteFileName -> {
                Query.Result<Query.Result.CompositeRowObject> result = store.executeQuery(
                    "MERGE (file:File:Local{absoluteFileName: $absoluteFileName}) RETURN file", Map.of("absoluteFileName", absoluteFileName));
                return result.getSingleResult()
                    .get("file", LocalFileDescriptor.class);
            });
        if (path.startsWith(root)) {
            localFileDescriptor.setFileName("./" + normalize(root.relativize(path)
                .toString()));
        }
        if (!type.isAssignableFrom(localFileDescriptor.getClass())) {
            return store.addDescriptorType(localFileDescriptor, type);
        }
        return type.cast(localFileDescriptor);
    }
}
