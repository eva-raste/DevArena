package com.devarena.dtos.errors;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    String message;
    HttpStatus status;


}
