package com.example.stronaQr.core.handler.exception.enums;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad Request"),
    MISSING_REQUEST_PARAMETER(HttpStatus.BAD_REQUEST, "Missing Request Parameter"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Not Found"),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong!"),
    CONFLICT(HttpStatus.CONFLICT, "Cannot execute, try again later!");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
