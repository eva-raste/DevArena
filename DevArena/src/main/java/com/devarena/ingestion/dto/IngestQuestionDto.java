package com.devarena.ingestion.dto;

import lombok.Data;
import java.util.List;

@Data
public class IngestQuestionDto {
    private String slug;
    private String title;
    private String description;
    private List<IngestExampleDto> examples;
    private String constraints;
    private Integer rating;
    private String origin;
}
