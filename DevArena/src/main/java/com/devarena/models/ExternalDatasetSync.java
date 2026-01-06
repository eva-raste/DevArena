package com.devarena.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "external_dataset_sync")
public class ExternalDatasetSync {

    @Id
    @Column(name = "dataset_name")
    private String datasetName;

    @Column(name = "last_sha", nullable = false)
    private String lastSha;

    @Column(name = "last_synced_at", nullable = false)
    private OffsetDateTime lastSyncedAt;
}

