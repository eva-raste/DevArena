package com.devarena.service;

import com.devarena.dtos.questions.Testcase;
import com.devarena.exception.testcases.TestcaseApiException;
import com.devarena.exception.testcases.TestcaseErrorCode;
import com.devarena.service.interfaces.ITestcaseParseService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class TestcaseParseService implements ITestcaseParseService {

    private static final long MAX_ZIP_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_TESTCASES = 200;
    private static final int MAX_INPUT_SIZE = 50_000;
    private static final int MAX_OUTPUT_SIZE = 10_000;

    @Override
    public List<Testcase> parse(MultipartFile zipFile) {

        validateZipFile(zipFile);

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("tc-parse-");

            unzipSafely(zipFile, tempDir);

            Path inputDir = tempDir.resolve("input");
            Path outputDir = tempDir.resolve("output");

            validateStructure(inputDir, outputDir);

            return readTestcases(inputDir, outputDir);

        } catch (TestcaseApiException e) {
            throw e; // propagate cleanly
        } catch (IOException e) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.INTERNAL_ERROR,
                    "Failed to parse testcases ZIP"
            );
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir);
            }
        }
    }

    private void validateZipFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.INVALID_TESTCASE_ZIP,
                    "ZIP file is empty"
            );
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.endsWith(".zip")) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.UNSUPPORTED_FILE_TYPE,
                    "Only ZIP files are allowed"
            );
        }

        if (file.getSize() > MAX_ZIP_SIZE) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.FILE_TOO_LARGE,
                    "ZIP file exceeds 10MB limit"
            );
        }
    }

    private void unzipSafely(MultipartFile zipFile, Path targetDir) throws IOException {

        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry entry;

            while ((entry = zis.getNextEntry()) != null) {

                if (entry.isDirectory()) continue;

                Path resolvedPath = targetDir.resolve(entry.getName()).normalize();

                if (!resolvedPath.startsWith(targetDir)) {
                    throw new TestcaseApiException(
                            TestcaseErrorCode.INVALID_TESTCASE_ZIP,
                            "Invalid ZIP entry detected"
                    );
                }

                Files.createDirectories(resolvedPath.getParent());
                Files.copy(zis, resolvedPath, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    private void validateStructure(Path inputDir, Path outputDir) {

        if (!Files.exists(inputDir) || !Files.isDirectory(inputDir)) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.INVALID_TESTCASE_ZIP,
                    "Missing input directory"
            );
        }

        if (!Files.exists(outputDir) || !Files.isDirectory(outputDir)) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.INVALID_TESTCASE_ZIP,
                    "Missing output directory"
            );
        }
    }

    private List<Testcase> readTestcases(Path inputDir, Path outputDir) throws IOException {

        List<Path> inputFiles;
        List<Path> outputFiles;

        try (var inStream = Files.list(inputDir);
             var outStream = Files.list(outputDir)) {

            inputFiles = inStream
                    .filter(p -> p.getFileName().toString().matches("input\\d+\\.txt"))
                    .sorted(Comparator.comparingInt(this::extractIndex))
                    .toList();

            outputFiles = outStream
                    .filter(p -> p.getFileName().toString().matches("output\\d+\\.txt"))
                    .sorted(Comparator.comparingInt(this::extractIndex))
                    .toList();
        }

        if (inputFiles.size() != outputFiles.size()) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.INVALID_TESTCASE_ZIP,
                    "Input/output testcase count mismatch"
            );
        }

        if (inputFiles.size() > MAX_TESTCASES) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                    "Too many testcases"
            );
        }

        List<Testcase> result = new ArrayList<>();

        for (int i = 0; i < inputFiles.size(); i++) {

            int expectedOrder = i + 1;

            if (extractIndex(inputFiles.get(i)) != expectedOrder ||
                    extractIndex(outputFiles.get(i)) != expectedOrder) {

                throw new TestcaseApiException(
                        TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                        "Testcase numbering must be continuous starting from 1"
                );
            }

            String input = readFile(inputFiles.get(i), MAX_INPUT_SIZE);
            String output = readFile(outputFiles.get(i), MAX_OUTPUT_SIZE);

            result.add(new Testcase(expectedOrder, input, output));
        }

        return result;
    }

    private String readFile(Path path, int maxSize) throws IOException {

        String content = Files.readString(path, StandardCharsets.UTF_8)
                .replace("\r\n", "\n")
                .stripTrailing();

        if (content.isBlank()) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                    "Testcase file cannot be empty"
            );
        }

        if (content.length() > maxSize) {
            throw new TestcaseApiException(
                    TestcaseErrorCode.TESTCASE_VALIDATION_FAILED,
                    "Testcase file too large"
            );
        }

        return content + "\n";
    }

    private int extractIndex(Path path) {
        String name = path.getFileName().toString();
        return Integer.parseInt(name.replaceAll("\\D+", ""));
    }

    private void deleteDirectory(Path path) {
        try {
            Files.walk(path)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.delete(p); } catch (IOException ignored) {}
                    });
        } catch (IOException ignored) {}
    }
}
