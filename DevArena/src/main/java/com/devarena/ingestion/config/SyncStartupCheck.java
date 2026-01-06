package com.devarena.ingestion.config;

import com.devarena.ingestion.service.DatasetSyncService;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SyncStartupCheck {

    private final DatasetSyncService syncService;

    public SyncStartupCheck(DatasetSyncService syncService) {
        this.syncService = syncService;
    }

    @PostConstruct
    public void check() throws Exception {
        System.out.println("Remote SHA = " + syncService.fetchRemoteSha());
        System.out.println("Should import = " + syncService.shouldImport());
    }
}
