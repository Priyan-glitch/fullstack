package com.stableroomies.authservice.exception;

import org.springframework.http.HttpStatus;

/** Carries the HTTP status an error should surface as. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
