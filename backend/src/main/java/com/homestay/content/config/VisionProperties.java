package com.homestay.content.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.vision")
public record VisionProperties(
        String baseUrl,
        String apiKey,
        String model,
        Integer maxTokens
) {
    public boolean missingApiKey() {
        return apiKey == null || apiKey.isBlank();
    }

    public int safeMaxTokens() {
        return maxTokens == null || maxTokens <= 0 ? 900 : maxTokens;
    }
}
