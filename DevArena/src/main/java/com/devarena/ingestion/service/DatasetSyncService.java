package com.devarena.ingestion.service;



import com.devarena.ingestion.client.SupabaseStorageClient;
import com.devarena.ingestion.dto.DatasetMetadataDto;
import com.devarena.models.ExternalDatasetSync;
import com.devarena.repositories.ExternalDatasetSyncRepo;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
public class DatasetSyncService {

    private static final String DATASET = "codeforces";

    private final SupabaseStorageClient storageClient;
    private final ExternalDatasetSyncRepo syncRepo;

    public DatasetSyncService(
            SupabaseStorageClient storageClient,
            ExternalDatasetSyncRepo syncRepo
    ) {
        this.storageClient = storageClient;
        this.syncRepo = syncRepo;
    }

    /** true = import required */
    public boolean shouldImport() throws Exception {
        DatasetMetadataDto meta =
                storageClient.fetchCodeforcesMetadata();

        return syncRepo.findById(DATASET)
                .map(sync -> !sync.getLastSha().equals(meta.getSha()))
                .orElse(true);
    }

    public void markImported(String sha) {
        ExternalDatasetSync sync = new ExternalDatasetSync(
                DATASET,
                sha,
                OffsetDateTime.now()
        );
        syncRepo.save(sync);
    }

    public String fetchRemoteSha() throws Exception {
        return storageClient.fetchCodeforcesMetadata().getSha();
    }
}

