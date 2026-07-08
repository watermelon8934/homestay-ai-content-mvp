package com.homestay.content.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeneratedContent(
        List<TitleOption> titles,

        @JsonProperty("selected_title")
        String selectedTitle,

        Body body,
        List<String> hashtags,

        @JsonProperty("image_suggestions")
        List<ImageSuggestion> imageSuggestions,

        @JsonProperty("evidence_summary")
        List<Evidence> evidenceSummary,

        @JsonProperty("compliance_warnings")
        List<ComplianceWarning> complianceWarnings
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TitleOption(String text, String angle, @JsonProperty("risk_level") String riskLevel) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Body(String text, String viewpoint, List<String> tone, String length) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ImageSuggestion(String scene, String purpose, @JsonProperty("must_be_real") Boolean mustBeReal) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Evidence(String claim, String source, @JsonProperty("source_excerpt") String sourceExcerpt) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ComplianceWarning(String type, String message) {
    }
}
