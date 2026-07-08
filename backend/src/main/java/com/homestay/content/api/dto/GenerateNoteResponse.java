package com.homestay.content.api.dto;

public record GenerateNoteResponse(
        boolean ok,
        NoteDraftPayload draft,
        String code,
        String error
) {
    public static GenerateNoteResponse ok(NoteDraftPayload draft) {
        return new GenerateNoteResponse(true, draft, null, null);
    }

    public static GenerateNoteResponse error(String code, String error) {
        return new GenerateNoteResponse(false, null, code, error);
    }
}
