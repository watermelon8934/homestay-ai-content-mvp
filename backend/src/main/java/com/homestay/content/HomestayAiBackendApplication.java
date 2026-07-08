package com.homestay.content;

import com.homestay.content.config.AiProperties;
import com.homestay.content.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({AiProperties.class, CorsProperties.class})
public class HomestayAiBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(HomestayAiBackendApplication.class, args);
    }
}
