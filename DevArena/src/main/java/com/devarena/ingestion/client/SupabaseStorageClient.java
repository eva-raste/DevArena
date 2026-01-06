package com.devarena.ingestion.client;


import com.devarena.ingestion.dto.DatasetMetadataDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class SupabaseStorageClient {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    private final ObjectMapper mapper = new ObjectMapper();

    public DatasetMetadataDto fetchCodeforcesMetadata() throws Exception {
        String url =
                supabaseUrl +
                        "/storage/v1/object/ingestion/codeforces/metadata.json";

        HttpURLConnection conn =
                (HttpURLConnection) new URL(url).openConnection();

        conn.setRequestMethod("GET");
        conn.setRequestProperty(
                "Authorization",
                "Bearer " + serviceRoleKey
        );
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(10_000);

        try (InputStream is = conn.getInputStream()) {
            return mapper.readValue(is, DatasetMetadataDto.class);
        }
    }
}
