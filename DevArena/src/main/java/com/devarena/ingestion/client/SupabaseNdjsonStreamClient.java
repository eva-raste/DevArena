package com.devarena.ingestion.client;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class SupabaseNdjsonStreamClient {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    public InputStream streamCodeforcesNdjson() throws Exception {
        String url =
                supabaseUrl +
                        "/storage/v1/object/ingestion/codeforces/codeforces_questions.ndjson";

        HttpURLConnection conn =
                (HttpURLConnection) new URL(url).openConnection();

        conn.setRequestMethod("GET");
        conn.setRequestProperty(
                "Authorization",
                "Bearer " + serviceRoleKey
        );
        conn.setConnectTimeout(10_000);
        conn.setReadTimeout(60_000);

        return conn.getInputStream(); // streaming, not loading whole file
    }
}
