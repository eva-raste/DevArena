package com.devarena.exception.testcases;

public class TestcaseApiException extends RuntimeException {
    private final TestcaseErrorCode errorCode;

    public  TestcaseApiException(TestcaseErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public TestcaseErrorCode getErrorCode() {
        return errorCode;
    }
}
