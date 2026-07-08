package com.homestay.content.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins, List<String> allowedOriginPatterns) {
    public List<String> safeAllowedOrigins() {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            return List.of(
                    "http://localhost:8080",
                    "http://localhost:5173",
                    "http://127.0.0.1:8080",
                    "http://127.0.0.1:5173"
            );
        }
        return allowedOrigins;
    }

    public List<String> safeAllowedOriginPatterns() {
        if (allowedOriginPatterns == null || allowedOriginPatterns.isEmpty()) {
            return List.of("https://*.vercel.app");
        }
        return allowedOriginPatterns;
    }
}
