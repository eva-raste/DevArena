package com.devarena.exception;

public class DuplicateQuestionSlugException extends RuntimeException {
    public DuplicateQuestionSlugException(String message) {
        super(message);
    }
}
