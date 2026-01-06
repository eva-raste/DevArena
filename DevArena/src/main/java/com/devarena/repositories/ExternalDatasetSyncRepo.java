package com.devarena.repositories;



import com.devarena.models.ExternalDatasetSync;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExternalDatasetSyncRepo
        extends JpaRepository<ExternalDatasetSync, String> {
}

