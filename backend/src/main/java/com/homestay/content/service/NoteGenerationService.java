package com.homestay.content.service;

import com.homestay.content.api.dto.GenerateNoteRequest;
import com.homestay.content.api.dto.NoteDraftPayload;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class NoteGenerationService {
    private final PromptBuilder promptBuilder;
    private final DeepSeekClient deepSeekClient;

    public NoteGenerationService(PromptBuilder promptBuilder, DeepSeekClient deepSeekClient) {
        this.promptBuilder = promptBuilder;
        this.deepSeekClient = deepSeekClient;
    }

    public NoteDraftPayload generate(GenerateNoteRequest request) {
        GeneratedContent content = deepSeekClient.generate(
                promptBuilder.systemPrompt(),
                promptBuilder.userPrompt(request)
        );

        return new NoteDraftPayload(
                UUID.randomUUID().toString(),
                Instant.now().toEpochMilli(),
                request.property(),
                request.review(),
                toTitles(content),
                safeText(content.body() == null ? null : content.body().text()),
                safeList(content.hashtags()),
                toImageIdeas(content.imageSuggestions()),
                toRationale(content.evidenceSummary()),
                toRisks(content.complianceWarnings())
        );
    }

    private List<String> toTitles(GeneratedContent content) {
        List<String> result = new ArrayList<>();
        if (content.titles() != null) {
            content.titles().stream()
                    .map(GeneratedContent.TitleOption::text)
                    .filter(text -> text != null && !text.isBlank())
                    .forEach(result::add);
        }
        if (result.isEmpty() && content.selectedTitle() != null && !content.selectedTitle().isBlank()) {
            result.add(content.selectedTitle());
        }
        return result;
    }

    private List<String> toImageIdeas(List<GeneratedContent.ImageSuggestion> suggestions) {
        if (suggestions == null) {
            return List.of();
        }
        return suggestions.stream()
                .map(item -> {
                    String scene = safeText(item.scene());
                    String purpose = safeText(item.purpose());
                    if (purpose.isBlank()) {
                        return scene;
                    }
                    return scene + "：" + purpose;
                })
                .filter(text -> !text.isBlank())
                .toList();
    }

    private String toRationale(List<GeneratedContent.Evidence> evidence) {
        if (evidence == null || evidence.isEmpty()) {
            return "已根据民宿资料和住客好评提炼标题、正文、标签与配图建议。";
        }
        return evidence.stream()
                .map(item -> {
                    String claim = safeText(item.claim());
                    String source = safeText(item.source());
                    String excerpt = safeText(item.sourceExcerpt());
                    return "- " + claim + "（来源：" + source + "；依据：" + excerpt + "）";
                })
                .toList()
                .stream()
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");
    }

    private List<String> toRisks(List<GeneratedContent.ComplianceWarning> warnings) {
        if (warnings == null || warnings.isEmpty()) {
            return List.of("发布前请确认正文中涉及的具体事实均来自真实民宿资料或住客好评。");
        }
        return warnings.stream()
                .map(GeneratedContent.ComplianceWarning::message)
                .filter(message -> message != null && !message.isBlank())
                .toList();
    }

    private List<String> safeList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream()
                .filter(value -> value != null && !value.isBlank())
                .toList();
    }

    private String safeText(String value) {
        return value == null ? "" : value.trim();
    }
}
