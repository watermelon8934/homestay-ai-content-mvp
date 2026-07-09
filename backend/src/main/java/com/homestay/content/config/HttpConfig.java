package com.homestay.content.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class HttpConfig {
    @Bean
    RestClient deepSeekRestClient(AiProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }

    @Bean
    RestClient visionRestClient(VisionProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .build();
    }

    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper().findAndRegisterModules();
    }
}
