package com.homestay.content.api.dto;

public record PropertyPayload(
        String name,

        String city,

        String roomCount,
        String highlights,
        String surroundings,
        String petPolicy,
        String notes
) {
}
