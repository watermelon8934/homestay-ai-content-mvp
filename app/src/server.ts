import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import type { NoteDraft, Property } from "./lib/types";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

type GenerateNoteInput = {
  review?: unknown;
  property?: unknown;
};

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

type GeneratedNoteJSON = {
  titles?: unknown;
  body?: unknown;
  tags?: unknown;
  imageIdeas?: unknown;
  rationale?: unknown;
  risks?: unknown;
};

type GeneratedNote = {
  titles: string[];
  body: string;
  tags: string[];
  imageIdeas: string[];
  rationale: string;
  risks: string[];
};

async function handleGenerateNote(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "只支持 POST 请求" }, 405);
  }

  const apiKey = getAIConfig().apiKey;
  if (!apiKey) {
    return json(
      {
        ok: false,
        code: "AI_KEY_MISSING",
        error: "还没有配置模型 API Key，暂时使用示例生成。",
      },
      503,
    );
  }

  let input: GenerateNoteInput;
  try {
    input = (await request.json()) as GenerateNoteInput;
  } catch {
    return json({ ok: false, error: "请求内容格式不正确" }, 400);
  }

  const review = typeof input.review === "string" ? input.review.trim() : "";
  const property = normalizeProperty(input.property);

  if (!property.name || !property.city || review.length < 30) {
    return json({ ok: false, error: "请填写民宿名、城市和至少 30 字好评" }, 400);
  }

  try {
    const generated = await callAIModel(review, property);
    const draft: NoteDraft = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      property,
      reviewInput: review,
      titles: generated.titles,
      body: generated.body,
      tags: generated.tags,
      imageIdeas: generated.imageIdeas,
      rationale: generated.rationale,
      risks: generated.risks,
    };

    return json({ ok: true, draft });
  } catch (error) {
    console.error(error);
    return json(
      { ok: false, error: "AI 生成失败，请重试。本次不计入额度。" },
      500,
    );
  }
}

async function callAIModel(
  review: string,
  property: Property,
): Promise<GeneratedNote> {
  const config = getAIConfig();
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(),
        },
        {
          role: "user",
          content: buildUserPrompt(review, property),
        },
      ],
      response_format: {
        type: "json_object",
      },
      stream: false,
      max_tokens: 2200,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | ChatCompletionPayload
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message =
      payload && "error" in payload ? payload.error?.message : undefined;
    throw new Error(message || `AI request failed: ${response.status}`);
  }

  const text = extractChatCompletionText(payload);
  const parsed = parseGeneratedJSON(text);
  return sanitizeGeneratedNote(normalizeGeneratedNote(parsed), review, property);
}

function getAIConfig() {
  const provider = process.env.AI_PROVIDER?.trim() || "deepseek";
  const baseUrl = process.env.AI_BASE_URL?.trim() || "https://api.deepseek.com";
  const model = process.env.AI_MODEL?.trim() || "deepseek-chat";
  const apiKey =
    process.env.AI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim() ||
    "";

  return { provider, baseUrl: baseUrl.replace(/\/$/, ""), model, apiKey };
}

function buildSystemPrompt() {
  return [
    "你是一个懂小红书民宿种草内容的中文内容策划助手。",
    "使用场景：民宿老板把 OTA 住客好评复制进来，你要把好评里的真实信息转化成一篇有宣传价值的小红书笔记。",
    "核心目标不是感谢客人，也不是复述评论，而是生成一篇民宿老板愿意直接复制发布的好内容。",
    "好内容的判断标准：标题让人愿意点开但不夸张；第一句话进入真实住宿决策场景；卖点具体且有依据；好评像信任背书一样自然出现；图片建议能指导老板选图；整篇读起来不像 AI、客服回复或感谢信。",
    "写作身份可以是民宿店铺/民宿主/内容运营，但不要频繁强调身份。",
    "不允许伪装游客真实入住，不写“我住过”“亲测”“刚退房”“入住体验”等游客第一人称表达。",
    "不要使用感谢信或客服回复口吻，禁止用“作为主理人，收到这样的住客好评”“客人说：”作为正文开头。",
    "可以自然转述好评，例如“这条评价里比较有参考价值的是……”“住客提到的这个细节，正好对应很多人挑民宿时会在意的问题”。",
    "只能使用用户提供的民宿资料和好评中明确出现的信息。",
    "标题、正文、标签、配图建议中的每个具体卖点都必须能从输入中找到依据。",
    "如果只输入了一条好评，不要写“反复提到”“很多客人提到”等暗示多条反馈的表达。",
    "不要把常见民宿卖点自动补进文案，例如安静、干净、停车、早餐、近景点、看山、亲子友好，除非输入中明确出现。",
    "未提供的信息不能写成确定事实，尤其是价格、距离、早餐、交通、宠物、设施、景观、服务承诺。",
    "可以把模糊信息写成克制表达，例如“周边逛起来方便”，不要擅自写具体距离或景点。",
    "避免极限词、虚假承诺、过度营销和平台违规风险；不要使用“最、第一、必住、天花板、闭眼冲、绝了”等表达。",
    "语言要像小红书民宿种草笔记：自然、轻松、信息密度高，有一点生活感，但不要油腻。",
    "输出前先在心里检查：这篇是不是老板看了觉得能发？是不是围绕潜在住客的选择理由？有没有编造？有没有感谢信味道？检查后只输出 JSON。",
    "输出必须是严格 JSON，不要 Markdown，不要解释。",
    "JSON 必须包含：titles、body、tags、imageIdeas、rationale、risks。",
  ].join("\n");
}

function buildUserPrompt(review: string, property: Property) {
  return JSON.stringify({
    content_strategy: {
      task: "把住客好评转成老板愿意直接发布的小红书好内容，不是感谢信。",
      audience: "正在小红书上搜索当地民宿、还在比较住哪里的人。",
      writing_angle:
        "从好评里提炼 2-4 个真实卖点，围绕适合谁、为什么值得看、发布前配什么图来组织正文。",
      quality_standard: [
        "标题：像真实小红书搜索结果，具体、有场景、不夸张。",
        "开头：第一句直接进入挑民宿/选住宿/适合谁，不从收到好评说起。",
        "正文：每段只讲一个选择理由，少用空泛形容词。",
        "好评：作为证据自然嵌入，不要整段搬运，不要写成客诉回复或感谢信。",
        "转化：让读者知道为什么这家值得点进主页或收藏，而不是喊口号。",
        "可信：所有具体事实都能回到输入材料。",
      ],
      preferred_openings: [
        "来这个城市挑民宿，如果你更在意……",
        "选住宿时，很多人会先看这几个点……",
        "这条住客反馈里，比较有参考价值的是……",
        "想住得舒服一点，可以重点看这几个细节……",
      ],
      forbidden_openings: [
        "作为主理人，收到这样的住客好评",
        "作为主理人，收到这段住客反馈",
        "客人说：",
        "最近有位住客留下这样几句话",
        "感谢客人的认可",
      ],
      body_structure: [
        "第一段：用搜索/挑选民宿场景开头，直接点出适合的人群或需求。",
        "中间：用 2-4 个小段落写真实卖点，每个卖点必须来自好评或民宿资料。",
        "好评佐证：自然转述，不要大段照抄；最多引用 1 句短句，引用后要解释它对挑民宿有什么参考价值。",
        "结尾：轻量引导收藏、点主页或对照图片，不要喊口号。",
      ],
      fact_rules: [
        "一条好评只能写“这条评价里提到”，不要写“反复提到”。",
        "没有明确出现“安静”，就不能写安静。",
        "没有明确出现“干净”，就不能写干净。",
        "没有明确出现景观，就不能写窗外风景、看山、院景等。",
        "配图建议只能建议拍输入中出现过的空间或细节。",
      ],
    },
    output_schema: {
      titles: "4 个标题，数组，每个不超过 28 个中文字符",
      body: "完整小红书正文，种草宣传口吻，分段清晰，可直接复制发布",
      tags: "8-12 个小红书话题标签，数组，每个以 # 开头",
      imageIdeas: "4-6 条配图建议，必须对应已提供事实",
      rationale: "简要说明你如何使用了好评和资料",
      risks: "3-5 条发布前风险提醒，数组",
    },
    example_json: {
      titles: [
        "来大理挑民宿，可以先看这几个细节",
        "带娃住两晚后，这条反馈挺有参考价值",
        "想住得省心点，这类民宿细节可以看",
        "大理住宿怎么选，可以看住客真实反馈",
      ],
      body: "来大理挑民宿，如果你更在意住得舒服、带孩子省心、周边逛起来方便，可以先看这几个细节。\n\n这条住客反馈里提到：房间干净，晚上安静，窗外能看到山，老板回复消息也比较及时。对还在比较住宿的人来说，这些都不是很花哨的卖点，但都和真实入住体验有关。\n\n如果是一家人住两晚，“整体很放松”其实很有参考价值。它说明这家民宿可以把基础体验做好：睡得舒服、沟通顺、出门逛也不费劲。\n\n发布图片时，可以把房间实拍、窗外角度和周边真实场景放在前几张，让文字里的信息都能被看见。想找大理民宿的话，可以先收藏起来对照看看。",
      tags: ["#大理民宿", "#小红书民宿", "#住客好评"],
      imageIdeas: ["房间干净整洁的实拍图"],
      rationale: "使用了好评中明确提到的信息，没有补充未提供事实。",
      risks: ["发布前请核对正文中的具体事实。"],
    },
    property,
    review,
  });
}

function extractChatCompletionText(payload: ChatCompletionPayload | null): string {
  const text = payload?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("AI response text is empty");
  }
  return text.trim();
}

function parseGeneratedJSON(text: string): GeneratedNoteJSON {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  return JSON.parse(cleaned) as GeneratedNoteJSON;
}

function normalizeGeneratedNote(
  generated: GeneratedNoteJSON,
): GeneratedNote {
  return {
    titles: asStringArray(generated.titles).slice(0, 4),
    body: asString(generated.body),
    tags: asStringArray(generated.tags).slice(0, 12),
    imageIdeas: asStringArray(generated.imageIdeas).slice(0, 6),
    rationale: asString(generated.rationale),
    risks: asStringArray(generated.risks).slice(0, 5),
  };
}

function sanitizeGeneratedNote(
  generated: GeneratedNote,
  review: string,
  property: Property,
): GeneratedNote {
  const source = [
    review,
    property.name,
    property.city,
    property.roomCount,
    property.highlights,
    property.surroundings,
    property.petPolicy,
    property.notes,
  ]
    .filter(Boolean)
    .join(" ");

  const sanitize = (text: string) => sanitizeTextBySource(text, source);
  return {
    titles: generated.titles.map(sanitize),
    body: sanitize(generated.body),
    tags: generated.tags.map(sanitizeTag),
    imageIdeas: generated.imageIdeas.map(sanitize),
    rationale: sanitize(generated.rationale),
    risks: generated.risks.map(sanitize),
  };
}

function sanitizeTextBySource(text: string, source: string): string {
  let next = text
    .replaceAll("反复提到", "提到")
    .replaceAll("很多客人提到", "这条评价里提到")
    .replaceAll("最有参考价值", "比较有参考价值")
    .replaceAll("最值得参考", "比较值得参考")
    .replaceAll("最看", "会先看")
    .replaceAll("必住", "可以看看")
    .replaceAll("闭眼冲", "发布前可以对照看看")
    .replaceAll("天花板", "比较有特点");

  if (!source.includes("安静")) {
    next = next
      .replaceAll("安静舒适", "舒服")
      .replaceAll("安静、", "")
      .replaceAll("安静，", "")
      .replaceAll("安静又", "")
      .replaceAll("安静的", "舒服的")
      .replaceAll("不吵的", "吃逛方便的")
      .replaceAll("安静", "舒服");
  }

  if (!source.includes("干净")) {
    next = next
      .replaceAll("干净整洁", "环境不错")
      .replaceAll("干净、", "")
      .replaceAll("干净，", "")
      .replaceAll("干净的", "环境不错的")
      .replaceAll("干净", "环境不错");
  }

  if (!source.includes("窗外")) {
    next = next
      .replaceAll("窗外或院子里的古城街景", "院子或周边街道照片")
      .replaceAll("窗外的古城街景", "周边街道照片")
      .replaceAll("窗外风景", "周边真实场景")
      .replaceAll("窗外", "周边");
  }

  return next;
}

function sanitizeTag(tag: string): string {
  return tag.replaceAll("必住", "民宿").replaceAll("天花板", "民宿");
}

function normalizeProperty(value: unknown): Property {
  const source = isRecord(value) ? value : {};
  return {
    name: asString(source.name).slice(0, 30).trim(),
    city: asString(source.city).slice(0, 20).trim(),
    roomCount: asOptionalString(source.roomCount),
    highlights: asOptionalString(source.highlights),
    surroundings: asOptionalString(source.surroundings),
    petPolicy: asOptionalString(source.petPolicy),
    notes: asOptionalString(source.notes),
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalString(value: unknown): string | undefined {
  const text = asString(value);
  return text || undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/generate-note") {
        return await handleGenerateNote(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
