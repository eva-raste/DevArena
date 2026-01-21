package com.devarena.helper;

import com.devarena.dtos.questions.CodeforcesQuestionPrefillDto;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
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

    public CodeforcesDatasetLoader(
            @Value("${datasets.codeforces.ndjson-url}") String ndjsonUrl
    ) {
        this.ndjsonUrl = ndjsonUrl;
    }

    /** 🔥 Background warm-up (non-blocking) */
    @Async
    public void preloadAsync() {
        loadInternal(false);
    }

    /** 🔥 Safe fallback for first request */
    public void ensureLoaded() {
        loadInternal(true);
    }

    private void loadInternal(boolean block) {
        if (loaded.get()) return;

        if (!loading.compareAndSet(false, true)) {
            if (block) {
                // wait until background finishes
                while (!loaded.get()) {
                    try {
                        Thread.sleep(50);
                    } catch (InterruptedException ignored) {}
                }
            }
            return;
        }

        try (BufferedReader reader =
                     new BufferedReader(
                             new InputStreamReader(
                                     new URL(ndjsonUrl).openStream()
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

        } catch (Exception e) {
            loading.set(false);
            throw new IllegalStateException("Failed to load Codeforces dataset", e);
        }
    }

    public CodeforcesQuestionPrefillDto get(String slug) {
        return cache.get(slug.toLowerCase());
    }
}

