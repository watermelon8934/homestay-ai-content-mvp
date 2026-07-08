package com.homestay.content.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestay.content.config.AiProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
public class DeepSeekClient {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AiProperties properties;

    public DeepSeekClient(RestClient deepSeekRestClient, ObjectMapper objectMapper, AiProperties properties) {
        this.restClient = deepSeekRestClient;
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    public GeneratedContent generate(String systemPrompt, String userPrompt) {
        if (properties.missingApiKey()) {
            throw new AiKeyMissingException();
        }

        Map<String, Object> body = Map.of(
                "model", properties.model(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "stream", false,
                "max_tokens", properties.safeMaxTokens(),
                "temperature", properties.safeTemperature()
        );

        try {
            JsonNode response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            String content = response == null
                    ? null
                    : response.path("choices").path(0).path("message").path("content").asText(null);

            if (content == null || content.isBlank()) {
                throw new NoteGenerationException("模型没有返回有效内容，请重试。");
            }

            return objectMapper.readValue(content, GeneratedContent.class);
        } catch (RestClientException e) {
            throw new NoteGenerationException("模型接口调用失败，请稍后重试。", e);
        } catch (Exception e) {
            if (e instanceof NoteGenerationException noteGenerationException) {
                throw noteGenerationException;
            }
            throw new NoteGenerationException("模型返回内容解析失败，请重试。", e);
        }
    }
}
