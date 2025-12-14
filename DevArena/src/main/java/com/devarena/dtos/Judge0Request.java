package com.devarena.dtos;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
public class Judge0Request {
    private Integer language_id;
    private String source_code;
    private String stdin;

    public Judge0Request(Integer language_id, String source_code, String stdin) {
        this.language_id = language_id;
        this.source_code = source_code;
        this.stdin = stdin;
    }

}
