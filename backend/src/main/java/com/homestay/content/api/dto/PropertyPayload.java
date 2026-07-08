package com.homestay.content.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PropertyPayload(
        @NotBlank(message = "请填写民宿名")
        String name,

        @NotBlank(message = "请填写所在城市")
        String city,

        String roomCount,
        String highlights,
        String surroundings,
        String petPolicy,
        String notes
) {
}
