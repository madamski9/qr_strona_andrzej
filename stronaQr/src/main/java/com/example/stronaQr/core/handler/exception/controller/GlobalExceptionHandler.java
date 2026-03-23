package com.example.stronaQr.core.handler.exception.controller;

import java.time.LocalDateTime;
import java.util.Arrays;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.stronaQr.core.handler.exception.ApiException;
import com.example.stronaQr.core.handler.exception.dto.ErrorResponseDto;
import com.example.stronaQr.core.handler.exception.enums.ErrorCode;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponseDto> handleApiException(ApiException ex) {
        ErrorCode errorCode = ex.getCode();

        ErrorResponseDto body = ErrorResponseDto.builder()
            .code(errorCode.name())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();

        return ResponseEntity.status(errorCode.getHttpStatus()).body(body);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDto> handleJsonParseError(HttpMessageNotReadableException ex) {

        String message = "Invalid request body";

        Throwable cause = ex.getCause();
        if (cause instanceof InvalidFormatException ife) {
            if (ife.getTargetType().isEnum()) {
                message = "Invalid value for enum. Allowed values: "
                        + Arrays.toString(ife.getTargetType().getEnumConstants());
            }
        }

        ErrorResponseDto body = ErrorResponseDto.builder()
            .code(ErrorCode.BAD_REQUEST.name())
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(body);
    }
}
