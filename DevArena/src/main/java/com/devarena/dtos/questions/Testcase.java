package com.devarena.dtos.questions;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Testcase {

    @Min(1)
    private int order;

    @NotBlank
    private String input;

    @NotBlank
    private String output;
}
