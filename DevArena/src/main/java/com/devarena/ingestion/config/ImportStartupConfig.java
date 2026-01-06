//package com.devarena.ingestion.config;
//
//
//import com.devarena.ingestion.importer.CodeforcesNdjsonImporter;
//import jakarta.annotation.PostConstruct;
//import org.springframework.context.annotation.Configuration;
//
//@Configuration
//public class ImportStartupConfig {
//
//    private final CodeforcesNdjsonImporter importer;
//
//    public ImportStartupConfig(CodeforcesNdjsonImporter importer) {
//        this.importer = importer;
//    }
//
//    @PostConstruct
//    public void run() throws Exception {
//        importer.importIfRequired();
//    }
//}
