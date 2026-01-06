package com.devarena.ingestion.dto;


import lombok.Data;

@Data
public class DatasetMetadataDto {
    private String dataset;
    private String config;
    private String sha;
    private String generated_at;
    private Integer record_count;
}

