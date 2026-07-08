package com.homestay.content.service;

public class NoteGenerationException extends RuntimeException {
    public NoteGenerationException(String message) {
        super(message);
    }

    public NoteGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
