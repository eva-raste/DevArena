//package com.devarena.ingestion.importer;
//
//
//
//import com.devarena.ingestion.IngestQuestionMapper;
//import com.devarena.ingestion.client.SupabaseNdjsonStreamClient;
//import com.devarena.ingestion.dto.IngestQuestionDto;
//import com.devarena.ingestion.service.DatasetSyncService;
//import com.devarena.models.Question;
//import com.devarena.repositories.IQuestionRepo;
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//import org.springframework.dao.DataIntegrityViolationException;
//import org.springframework.stereotype.Component;
//
//import java.io.BufferedReader;
//import java.io.InputStreamReader;
//
//@Component
//public class CodeforcesNdjsonImporter {
//
//    private final SupabaseNdjsonStreamClient streamClient;
//    private final IQuestionRepo questionRepo;
//    private final DatasetSyncService syncService;
//
//    private final ObjectMapper mapper = new ObjectMapper();
//
//    public CodeforcesNdjsonImporter(
//            SupabaseNdjsonStreamClient streamClient,
//            IQuestionRepo questionRepo,
//            DatasetSyncService syncService
//    ) {
//        this.streamClient = streamClient;
//        this.questionRepo = questionRepo;
//        this.syncService = syncService;
//    }
//
//    public void importIfRequired() throws Exception {
//        if (!syncService.shouldImport()) {
//            System.out.println("✔ Codeforces dataset already up to date");
//            return;
//        }
//
//        System.out.println("▶ Importing Codeforces questions...");
//
//        int imported = 0;
//        int skipped = 0;
//
//        try (BufferedReader reader = new BufferedReader(
//                new InputStreamReader(
//                        streamClient.streamCodeforcesNdjson()
//                )
//        )) {
//            String line;
//            while ((line = reader.readLine()) != null) {
//
//                IngestQuestionDto dto =
//                        mapper.readValue(line, IngestQuestionDto.class);
//
//                Question q = IngestQuestionMapper.toEntity(dto);
//
//                try {
//                    questionRepo.save(q);
//                    imported++;
//                } catch (DataIntegrityViolationException e) {
//                    skipped++; // duplicate slug + origin
//                }
//            }
//        }
//
//        String sha = syncService.fetchRemoteSha();
//        syncService.markImported(sha);
//
//        System.out.println("✔ Import complete");
//        System.out.println("Imported: " + imported);
//        System.out.println("Skipped (duplicates): " + skipped);
//        System.out.println("SHA recorded: " + sha);
//    }
//}
//
