package com.devarena.helper;

import com.devarena.dtos.questions.CodeforcesQuestionPrefillDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class CodeforcesDatasetLoader {

    private final String ndjsonUrl;
    private final Map<String, CodeforcesQuestionPrefillDto> cache =
            new ConcurrentHashMap<>();

    private final AtomicBoolean loading = new AtomicBoolean(false);
    private final AtomicBoolean loaded = new AtomicBoolean(false);

    private static final int CONNECT_TIMEOUT = 5000;
    private static final int READ_TIMEOUT = 15000;

    public CodeforcesDatasetLoader(
            @Value("${datasets.codeforces.ndjson-url}") String ndjsonUrl
    ) {
        this.ndjsonUrl = ndjsonUrl;
    }

    // Non-blocking warmup
    @Async
    public void preloadAsync() {
        try {
            loadInternal();
        } catch (Exception e) {
            System.err.println("Codeforces preload failed: " + e.getMessage());
        }
    }

    // Blocking fallback (first request)
    public void ensureLoaded() {
        if (!loaded.get()) {
            loadInternal();
        }
    }

    private void loadInternal() {

        if (loaded.get()) return;

        if (!loading.compareAndSet(false, true)) {
            // Someone else is loading
            return;
        }

        HttpURLConnection connection = null;

        try {
            URL url = new URL(ndjsonUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(CONNECT_TIMEOUT);
            connection.setReadTimeout(READ_TIMEOUT);
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "devarena-dataset-loader");

            int status = connection.getResponseCode();
            if (status != 200) {
                throw new RuntimeException("HTTP error: " + status);
            }

            try (BufferedReader reader =
                         new BufferedReader(
                                 new InputStreamReader(
                                         connection.getInputStream(),
                                         StandardCharsets.UTF_8
                                 ))) {

                ObjectMapper mapper = new ObjectMapper();
                String line;

                while ((line = reader.readLine()) != null) {
                    CodeforcesQuestionPrefillDto dto =
                            mapper.readValue(line, CodeforcesQuestionPrefillDto.class);

                    cache.put(dto.getSlug().toLowerCase(), dto);
                }

                loaded.set(true);
                System.out.println("✔ Codeforces dataset loaded (" + cache.size() + ")");

            }

        } catch (Exception e) {
            System.err.println("Failed to load Codeforces dataset: " + e.getMessage());
            loaded.set(false);
        } finally {
            loading.set(false);
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    public CodeforcesQuestionPrefillDto get(String slug) {
        return cache.get(slug.toLowerCase());
    }

    public boolean isLoaded() {
        return loaded.get();
    }
}