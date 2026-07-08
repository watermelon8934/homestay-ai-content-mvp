package com.homestay.content.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GenerateNoteRequest(
        @NotBlank(message = "好评内容不能为空")
        @Size(min = 30, message = "好评至少 30 个字，越具体生成效果越好")
        String review,

        @Valid
        @NotNull(message = "民宿资料不能为空")
        PropertyPayload property
) {
}
