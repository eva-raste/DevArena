package com.devarena.dtos.judge0;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
public class Judge0Response {
    private String stdout;
    private String stderr;
    private String compile_output;
    private Status status;

    @Getter
    public static class Status {
        private Integer id;
        private String description;

    }
}
