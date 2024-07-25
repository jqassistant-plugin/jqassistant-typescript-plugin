package org.jqassistant.plugin.typescript;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class TestUtils {

    private final String scanResourcePath;

    public TestUtils() {
        scanResourcePath = TestUtils.class.getResource("/").getPath();
    }

    /**
     * Reads the report JSON and replaces all cropped paths with proper absolute paths for the local system
     * @param fileName file name of the ts-output.json that should be read
     * @return File object to the modified version of the report JSON
     */
    public File getReportJson(String fileName) {
        try {
            Path inputPath = Paths.get(TestUtils.class.getResource("/" + fileName + ".json").getPath());
            String content = new String(Files.readAllBytes(inputPath));
            content = content.replaceAll("/java/src/test/resources/", scanResourcePath);
            Files.write(Paths.get(scanResourcePath + fileName + ".tmp.json"), content.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return new File(scanResourcePath + fileName + ".tmp.json");
    }

    /**
     * @param path cropped-off absolute path that starts with "/java/src/test/resources/"
     * @return proper absolute path
     */
    public String resolvePath(String path) {
        return path.replace("/java/src/test/resources/", scanResourcePath);
    }

}
