import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const projectDir = path.resolve(appDir, "..");
const outputDir = path.join(projectDir, "samples", "quality-tests");

await loadLocalEnv(path.join(appDir, ".env.local"));

const args = parseArgs(process.argv.slice(2));
const review =
  args.review ??
  "民宿环境很不错，卫生间和洗浴间是干湿分离的，老板人超好，外面有个小院子，可以坐着吹吹风，很舒服，就在大理古城内，出来就有很多好吃的。";

const property = {
  name: args.name ?? "米糖的院子",
  city: args.city ?? "大理",
  roomCount: args.roomCount ?? "",
  highlights: args.highlights ?? "古城内，小院子，干湿分离",
  surroundings: args.surroundings ?? "大理古城内，出来有很多好吃的",
  petPolicy: args.petPolicy ?? "",
  notes: args.notes ?? "不要夸大，不要写游客第一人称",
};

await mkdir(outputDir, { recursive: true });

const generated = await callAIModel(review, property).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("内容质量测试没有跑通。");
  console.error("常见原因：当前环境无法访问模型接口，或 app/.env.local 里的模型配置不可用。");
  console.error(`原始错误：${message}`);
  process.exit(1);
});
const checks = evaluate(generated);
const report = toMarkdown({ review, property, generated, checks });
const outputPath = path.join(
  outputDir,
  `${new Date().toISOString().replace(/[:.]/g, "-")}-note-quality.md`,
);

await writeFile(outputPath, report, "utf8");

console.log(`已生成内容质量报告：${outputPath}`);
console.log(`初步评分：${checks.score}/100`);
console.log(`需要重点看：${checks.issues.length ? checks.issues.join("；") : "暂无明显问题"}`);

function evaluate(note) {
  const fullText = [note.titles.join("\n"), note.body, note.tags.join(" ")].join("\n");
  const issues = [];
  let score = 100;

  const forbidden = [
    "作为主理人",
    "客人说：",
    "感谢客人",
    "亲测",
    "我住过",
    "刚退房",
    "闭眼冲",
    "天花板",
    "必住",
    "绝了",
  ];

  for (const word of forbidden) {
    if (fullText.includes(word)) {
      issues.push(`出现不建议表达：${word}`);
      score -= 10;
    }
  }

  if (!note.body.includes("挑") && !note.body.includes("选") && !note.body.includes("适合")) {
    issues.push("开头可能没有进入住宿选择场景");
    score -= 12;
  }

  if (note.body.length < 180) {
    issues.push("正文偏短，可能卖点展开不够");
    score -= 8;
  }

  if (note.tags.length < 6) {
    issues.push("标签数量偏少");
    score -= 6;
  }

  if (note.imageIdeas.length < 3) {
    issues.push("配图建议偏少");
    score -= 6;
  }

  return { score: Math.max(0, score), issues };
}

async function callAIModel(reviewText, propertyInfo) {
  const config = getAIConfig();
  if (!config.apiKey) {
    throw new Error("缺少模型 API Key，请先检查 app/.env.local。");
  }

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
          content: [
            "你是一个懂小红书民宿种草内容的中文内容策划助手。",
            "使用场景：民宿老板把 OTA 住客好评复制进来，你要把好评里的真实信息转化成一篇有宣传价值的小红书笔记。",
            "核心目标不是感谢客人，也不是复述评论，而是生成一篇民宿老板愿意直接复制发布的好内容。",
            "好内容的判断标准：标题让人愿意点开但不夸张；第一句话进入真实住宿决策场景；卖点具体且有依据；好评像信任背书一样自然出现；图片建议能指导老板选图；整篇读起来不像 AI、客服回复或感谢信。",
            "不允许伪装游客真实入住，不写“我住过”“亲测”“刚退房”“入住体验”等游客第一人称表达。",
            "不要使用感谢信或客服回复口吻，禁止用“作为主理人，收到这样的住客好评”“客人说：”作为正文开头。",
            "只能使用用户提供的民宿资料和好评中明确出现的信息。",
            "如果只输入了一条好评，不要写“反复提到”“很多客人提到”等暗示多条反馈的表达。",
            "不要把常见民宿卖点自动补进文案，例如安静、干净、停车、早餐、近景点、看山、亲子友好，除非输入中明确出现。",
            "避免极限词、虚假承诺、过度营销和平台违规风险；不要使用“最、第一、必住、天花板、闭眼冲、绝了”等表达。",
            "输出必须是严格 JSON，不要 Markdown，不要解释。",
            "JSON 必须包含：titles、body、tags、imageIdeas、rationale、risks。",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify({
            content_strategy: {
              task: "把住客好评转成老板愿意直接发布的小红书好内容，不是感谢信。",
              audience: "正在小红书上搜索当地民宿、还在比较住哪里的人。",
              quality_standard: [
                "标题：像真实小红书搜索结果，具体、有场景、不夸张。",
                "开头：第一句直接进入挑民宿/选住宿/适合谁，不从收到好评说起。",
                "正文：每段只讲一个选择理由，少用空泛形容词。",
                "好评：作为证据自然嵌入，不要整段搬运，不要写成客诉回复或感谢信。",
                "转化：让读者知道为什么这家值得点进主页或收藏，而不是喊口号。",
                "可信：所有具体事实都能回到输入材料。",
              ],
              body_structure: [
                "第一段：用搜索/挑选民宿场景开头，直接点出适合的人群或需求。",
                "中间：用 2-4 个小段落写真实卖点，每个卖点必须来自好评或民宿资料。",
                "好评佐证：自然转述，不要大段照抄；最多引用 1 句短句，引用后要解释它对挑民宿有什么参考价值。",
                "结尾：轻量引导收藏、点主页或对照图片，不要喊口号。",
              ],
              forbidden_openings: [
                "作为主理人，收到这样的住客好评",
                "作为主理人，收到这段住客反馈",
                "客人说：",
                "最近有位住客留下这样几句话",
                "感谢客人的认可",
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
            property: propertyInfo,
            review: reviewText,
          }),
        },
      ],
      response_format: {
        type: "json_object",
      },
      stream: false,
      max_tokens: 2200,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `AI 请求失败：${response.status}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("模型没有返回内容。");

  const parsed = JSON.parse(
    content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, ""),
  );

  return {
    titles: asStringArray(parsed.titles).slice(0, 4),
    body: asString(parsed.body),
    tags: asStringArray(parsed.tags).slice(0, 12),
    imageIdeas: asStringArray(parsed.imageIdeas).slice(0, 6),
    rationale: asString(parsed.rationale),
    risks: asStringArray(parsed.risks).slice(0, 5),
  };
}

function getAIConfig() {
  const baseUrl = process.env.AI_BASE_URL?.trim() || "https://api.deepseek.com";
  const model = process.env.AI_MODEL?.trim() || "deepseek-chat";
  const apiKey =
    process.env.AI_API_KEY?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim() ||
    "";

  return { baseUrl: baseUrl.replace(/\/$/, ""), model, apiKey };
}

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean);
}

function toMarkdown({ review, property, generated, checks }) {
  return [
    "# 小红书笔记内容质量测试",
    "",
    `- 生成时间：${new Date().toLocaleString("zh-CN")}`,
    `- 初步评分：${checks.score}/100`,
    `- 重点问题：${checks.issues.length ? checks.issues.join("；") : "暂无明显问题"}`,
    "",
    "## 输入",
    "",
    `- 民宿：${property.name}`,
    `- 城市：${property.city}`,
    `- 卖点：${property.highlights || "未填写"}`,
    `- 周边：${property.surroundings || "未填写"}`,
    "",
    "### 好评",
    "",
    review,
    "",
    "## 标题",
    "",
    ...generated.titles.map((title, index) => `${index + 1}. ${title}`),
    "",
    "## 正文",
    "",
    generated.body,
    "",
    "## 标签",
    "",
    generated.tags.join(" "),
    "",
    "## 配图建议",
    "",
    ...generated.imageIdeas.map((idea, index) => `${index + 1}. ${idea}`),
    "",
    "## 生成依据",
    "",
    generated.rationale,
    "",
    "## 风险提醒",
    "",
    ...generated.risks.map((risk, index) => `${index + 1}. ${risk}`),
    "",
    "## 人工复核",
    "",
    "- 老板是否愿意复制发布：待定",
    "- 是否像小红书：待定",
    "- 是否有编造：待定",
    "- 是否需要改 Prompt：待定",
    "",
  ].join("\n");
}

function loadLocalEnv(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFile(filePath, "utf8");
  return text.then((content) => {
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index <= 0) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = value;
    }
  });
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    parsed[key] = next && !next.startsWith("--") ? next : "true";
    if (next && !next.startsWith("--")) i += 1;
  }
  return parsed;
}
