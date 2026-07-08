package com.homestay.content.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ai")
public record AiProperties(
        String baseUrl,
        String apiKey,
        String model,
        Integer maxTokens,
        Double temperature
) {
    public int safeMaxTokens() {
        return maxTokens == null || maxTokens <= 0 ? 2200 : maxTokens;
    }

    public double safeTemperature() {
        return temperature == null ? 0.7 : temperature;
    }

    public boolean missingApiKey() {
        return apiKey == null || apiKey.isBlank();
    }
}
