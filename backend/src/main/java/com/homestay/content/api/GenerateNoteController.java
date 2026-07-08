package com.homestay.content.api;

import com.homestay.content.api.dto.GenerateNoteRequest;
import com.homestay.content.api.dto.GenerateNoteResponse;
import com.homestay.content.service.NoteGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GenerateNoteController {
    private final NoteGenerationService noteGenerationService;

    public GenerateNoteController(NoteGenerationService noteGenerationService) {
        this.noteGenerationService = noteGenerationService;
    }

    @PostMapping("/generate-note")
    public ResponseEntity<GenerateNoteResponse> generateNote(@Valid @RequestBody GenerateNoteRequest request) {
        return ResponseEntity.ok(GenerateNoteResponse.ok(noteGenerationService.generate(request)));
    }
}
