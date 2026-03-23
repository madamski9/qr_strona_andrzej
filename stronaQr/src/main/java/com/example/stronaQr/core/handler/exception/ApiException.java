package com.example.stronaQr.core.handler.exception;

import com.example.stronaQr.core.handler.exception.enums.ErrorCode;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final ErrorCode code;

    public ApiException(ErrorCode code) {
        super(code.getMessage());
        this.code = code;
    }

    public ApiException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }
}
