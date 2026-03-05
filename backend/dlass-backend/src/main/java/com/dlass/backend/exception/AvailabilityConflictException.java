package com.dlass.backend.exception;

public class AvailabilityConflictException extends RuntimeException {

    public AvailabilityConflictException(String message) {
        super(message);
    }

}