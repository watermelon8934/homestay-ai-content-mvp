package com.homestay.content.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.homestay.content.api.dto.GenerateNoteRequest;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PromptBuilder {
    private final ObjectMapper objectMapper;

    public PromptBuilder(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String systemPrompt() {
        return """
                你是一个懂小红书民宿种草内容的中文内容策划助手。

                使用场景：民宿老板把 OTA 住客好评复制进来，你要把好评里的真实信息转化成一篇有宣传价值的小红书笔记。

                核心目标不是感谢客人，也不是复述评论，而是生成一篇民宿老板愿意直接复制发布的好内容。

                好内容的判断标准：
                - 标题让人愿意点开但不夸张。
                - 第一句话进入真实住宿决策场景。
                - 卖点具体且有依据。
                - 好评像信任背书一样自然出现。
                - 图片建议能指导老板选图。
                - 整篇读起来不像 AI、客服回复或感谢信。

                你必须遵守：
                1. 只能基于用户提供的信息写作。
                2. 不得编造价格、距离、排名、获奖、设施、服务、交通、房型、景观、宠物政策、早餐等具体事实。
                3. 未提供的信息不能写成确定事实。
                4. 不得伪装成游客真实入住，不得使用“我住过”“亲测”“刚退房”等游客第一人称入住表达。
                5. 写作身份可以是民宿店铺、民宿主或内容运营，但不要频繁强调身份。
                6. 不要使用感谢信或客服回复口吻，禁止用“作为主理人，收到这样的住客好评”“客人说：”作为正文开头。
                7. 可以自然转述好评，例如“这条评价里比较有参考价值的是……”“住客提到的这个细节，正好对应很多人挑民宿时会在意的问题”。
                8. 避免极限词、绝对化承诺、虚假承诺和过度营销表达。
                9. 输出必须是合法 json，不要输出 Markdown，不要输出额外解释。
                """;
    }

    public String userPrompt(GenerateNoteRequest request) {
        Map<String, Object> input = Map.of(
                "homestay_profile", request.property(),
                "source_reviews", new String[]{request.review()},
                "extra_context", Map.of(
                        "desired_length", "medium",
                        "highlight_focus", "",
                        "avoid_topics", new String[0]
                )
        );

        try {
            return """
                    请根据以下信息生成小红书民宿笔记。

                    输入信息：
                    %s

                    请输出合法 json，结构必须为：
                    {
                      "titles": [
                        {"text": "标题文案", "angle": "标题角度", "risk_level": "low"}
                      ],
                      "selected_title": "推荐标题，必须来自 titles.text",
                      "body": {
                        "text": "完整正文",
                        "viewpoint": "homestay_owner_or_operator",
                        "tone": ["种草", "自然", "克制"],
                        "length": "medium"
                      },
                      "hashtags": ["#民宿", "#城市民宿"],
                      "image_suggestions": [
                        {"scene": "建议图片场景", "purpose": "这张图承担的作用", "must_be_real": true}
                      ],
                      "evidence_summary": [
                        {"claim": "正文中使用的卖点", "source": "profile | review | extra_context", "source_excerpt": "对应输入片段"}
                      ],
                      "compliance_warnings": [
                        {"type": "missing_info | exaggeration_risk | platform_risk", "message": "发布前确认或补充的信息"}
                      ],
                      "rewrite_options": {
                        "softer": "更克制版本建议，可为空",
                        "more_lifestyle": "更生活方式种草建议，可为空",
                        "more_family_friendly": "更亲子向建议，可为空"
                      }
                    }

                    要求：
                    - 返回 3 到 5 个标题。
                    - 正文开头直接进入“挑民宿/找住宿/适合谁”的场景。
                    - 好评是佐证素材，不要大段照抄。
                    - 不要写成感谢信，不要用“客人说：”统领全文。
                    - 不编造输入中没有的具体事实。
                    - 只输出 json。
                    """.formatted(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(input));
        } catch (JsonProcessingException e) {
            throw new NoteGenerationException("输入内容整理失败，请稍后重试。", e);
        }
    }
}
