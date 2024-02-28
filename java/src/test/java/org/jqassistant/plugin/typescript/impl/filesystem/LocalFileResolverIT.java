package org.jqassistant.plugin.typescript.impl.filesystem;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.buschmais.jqassistant.core.scanner.api.ScannerContext;
import com.buschmais.jqassistant.core.shared.io.ClasspathResource;
import com.buschmais.jqassistant.core.test.plugin.AbstractPluginIT;
import com.buschmais.jqassistant.plugin.common.api.model.DirectoryDescriptor;
import com.buschmais.jqassistant.plugin.common.api.model.FileDescriptor;

import org.jqassistant.plugin.typescript.api.model.core.LocalFileDescriptor;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LocalFileResolverIT extends AbstractPluginIT {

    @Test
    void resolve() {
        store.beginTransaction();
        ScannerContext context = getScanner().getContext();

        Path testResources = Paths.get("src/test/resources");
        Path project3 = testResources.resolve("java-it-core-multi-sample-projects/project3");
        Path project3tsconfig = testResources.resolve("java-it-core-multi-sample-projects/project3/tsconfig.json");
        Path subproject31 = testResources.resolve("java-it-core-multi-sample-projects/project3/subproject31");
        Path subproject31tsconfig = testResources.resolve("java-it-core-multi-sample-projects/project3/subproject31/tsconfig.json");

        LocalFileResolver project3FileResolver = new LocalFileResolver(project3);
        FileDescriptor project3Descriptor = project3FileResolver.require(project3.toAbsolutePath()
            .toString(), FileDescriptor.class, context);
        verifyLocalFileDescriptor(project3Descriptor, project3, "./");
        assertThat(project3Descriptor.getParents()).allSatisfy(parent -> assertThat(parent).isInstanceOf(DirectoryDescriptor.class));

        FileDescriptor project3tsconfigDescriptor = project3FileResolver.require(project3tsconfig.toAbsolutePath()
            .toString(), FileDescriptor.class, context);
        verifyLocalFileDescriptor(project3tsconfigDescriptor, project3tsconfig, "./tsconfig.json");
        assertThat(project3tsconfigDescriptor.getParents()).hasSize(1)
            .containsExactly(project3Descriptor);
        assertThat(project3Descriptor).isNotInstanceOf(DirectoryDescriptor.class);

        LocalFileResolver subproject31FileResolver = new LocalFileResolver(subproject31);
        FileDescriptor subproject31Descriptor = subproject31FileResolver.require(subproject31.toAbsolutePath()
            .toString(), FileDescriptor.class, context);
        verifyLocalFileDescriptor(subproject31Descriptor, subproject31, "./");
        assertThat(subproject31Descriptor.getParents()).hasSize(1)
            .containsExactly(project3Descriptor);

        FileDescriptor subproject31tsconfigDescriptor = subproject31FileResolver.require(subproject31tsconfig.toAbsolutePath()
            .toString(), FileDescriptor.class, context);
        verifyLocalFileDescriptor(subproject31tsconfigDescriptor, subproject31tsconfig, "./tsconfig.json");
        assertThat(subproject31tsconfigDescriptor.getParents()).hasSize(1)
            .containsExactly(subproject31Descriptor);
        assertThat(subproject31tsconfigDescriptor).isNotInstanceOf(DirectoryDescriptor.class);

        store.commitTransaction();
    }

    private static void verifyLocalFileDescriptor(FileDescriptor fileDescriptor, Path expectedAbsolutePath, String expectedFileName) {
        assertThat(fileDescriptor.getFileName()).isEqualTo(expectedFileName);
        assertThat(fileDescriptor).isInstanceOf(LocalFileDescriptor.class);
        LocalFileDescriptor localFileDescriptor = (LocalFileDescriptor) fileDescriptor;
        assertThat(Paths.get(localFileDescriptor.getAbsoluteFileName())).isEqualTo(expectedAbsolutePath.toAbsolutePath());
    }

    protected File getClassesDirectory(Class<?> rootClass) {
        return ClasspathResource.getFile(rootClass, "/");
    }
}
