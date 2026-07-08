package com.homestay.content.api;

import com.homestay.content.api.dto.GenerateNoteResponse;
import com.homestay.content.service.AiKeyMissingException;
import com.homestay.content.service.NoteGenerationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AiKeyMissingException.class)
    public ResponseEntity<GenerateNoteResponse> handleAiKeyMissing() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(GenerateNoteResponse.error("AI_KEY_MISSING", "后端还没有配置模型 Key，已暂时无法生成。"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<GenerateNoteResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage() == null ? "输入内容不完整" : error.getDefaultMessage())
                .orElse("输入内容不完整");
        return ResponseEntity.badRequest().body(GenerateNoteResponse.error("INVALID_INPUT", message));
    }

    @ExceptionHandler(NoteGenerationException.class)
    public ResponseEntity<GenerateNoteResponse> handleGeneration(NoteGenerationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(GenerateNoteResponse.error("AI_GENERATION_FAILED", ex.getMessage()));
    }
}
