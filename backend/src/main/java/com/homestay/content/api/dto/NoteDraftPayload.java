package com.homestay.content.api.dto;

import java.util.List;

public record NoteDraftPayload(
        String id,
        long createdAt,
        PropertyPayload property,
        String reviewInput,
        List<String> titles,
        String body,
        List<String> tags,
        List<String> imageIdeas,
        String rationale,
        List<String> risks
) {
}
