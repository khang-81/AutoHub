package com.tobeto.rentACar.core.exceptions.types;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
