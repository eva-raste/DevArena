package com.devarena.helper;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatasetWarmup {

    private final CodeforcesDatasetLoader loader;

    @EventListener(ApplicationReadyEvent.class)
    public void warmup() {
        loader.preloadAsync(); // async, app stays responsive
    }
}

