import type { NoteDraft, Property } from "./types";

// 说明：本原型使用固定的安全示例输出，仅使用用户提供或好评明确提到的信息。
// 严禁出现未提供的场景细节（森林、山谷、虫鸣、山脚下、徒步、院子、露台、
// 茶壶、木椅、木、麻、石 等）。

const FIXED_TITLES = [
  "来大理挑民宿，可以先看这几个细节",
  "带娃住两晚后，这条反馈挺有参考价值",
  "想住得省心点，这类民宿细节可以看",
  "大理住宿怎么选，可以看住客真实反馈",
];

const FIXED_TAGS = [
  "#大理民宿",
  "#大理旅行",
  "#亲子出行",
  "#安静民宿",
  "#民宿推荐",
  "#小红书民宿",
  "#住客好评",
  "#放松旅行",
  "#大理住宿",
];

const FIXED_IMAGE_IDEAS = [
  "房间干净整洁的实拍图",
  "窗外能看到山的角度",
  "适合带孩子入住的房间细节",
  "民宿周边方便出行或逛逛的真实场景",
  "与住客好评内容对应的截图或整理图",
];

function extractQuotes(review: string): string[] {
  const parts = review
    .split(/[。！？!?\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 6 && s.length <= 40);
  return parts.slice(0, 2);
}

function buildBody(property: Property, quotes: string[]): string {
  const city = property.city || "大理";
  const name = property.name || "山间小院";

  const quoteBlock =
    quotes.length > 0
      ? `\n\n这条评价里有一句很适合做参考：\n「${quotes[0]}」\n\n它不是夸张的营销词，但能帮正在选住宿的人判断这里是不是适合自己。`
      : "";

  return [
    `来${city}挑民宿，如果你更在意住得舒服、带孩子省心、周边逛起来方便，可以先看这几个细节。`,
    "",
    `${name}这条住客反馈里，比较值得看的不是一句“推荐”，而是几个很具体的体验点：房间干净、晚上安静、窗外能看到山，消息回复也比较及时。`,
    quoteBlock,
    "",
    "如果是一家人住两晚，“整体很放松”其实很有参考价值。它说明这家民宿可以把基础体验做好：睡得舒服、沟通顺、出门逛也不费劲。",
    "",
    "发布时可以把房间实拍、窗外角度和周边真实场景放在前几张，让文字里的信息都能被看见。想找这类住宿的话，可以先收藏起来对照看看。",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildRisks(): string[] {
  return [
    "内容原则：未在好评或民宿资料中出现的信息，未写入标题、正文、标签与配图建议。发布前如需补充具体事实，请你亲自校对。",
    "以下信息未在好评或资料中出现，未写入正文：早餐、价格、距离/交通、宠物政策、特定设施。如需强调请自行补充。",
    "已使用民宿主视角，未使用「刚住过」「亲测」「刚退房」等游客第一人称表达。",
    "已避免「最」「第一」「独家」「绝对」「性价比」等极限词与主观评价词，发布前请再通读一次。",
  ];
}

export type GenerateResult =
  | { ok: true; draft: NoteDraft }
  | { ok: false; error: string };

export function mockGenerate(
  review: string,
  property: Property,
): Promise<GenerateResult> {
  return new Promise((resolve) => {
    const delay = 1500 + Math.random() * 1000;
    setTimeout(() => {
      if (Math.random() < 0.1) {
        resolve({ ok: false, error: "生成失败，请重试。本次不计入额度。" });
        return;
      }
      const quotes = extractQuotes(review);
      const body = buildBody(property, quotes);

      const rationale = [
        "本示例采用小红书种草结构：开头进入挑民宿场景，中间提炼真实卖点，结尾提示如何配图和收藏对照。",
        quotes.length
          ? "从好评中提取了 1 句短句作为信任背书，没有整段搬运评价。"
          : "未提取到合适长度的引用句。",
        "标题、标签、配图建议均围绕输入中的城市、住宿体验和好评信息组织。",
      ].join("\n");

      const draft: NoteDraft = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        property,
        reviewInput: review,
        titles: [...FIXED_TITLES],
        body,
        tags: [...FIXED_TAGS],
        imageIdeas: [...FIXED_IMAGE_IDEAS],
        rationale,
        risks: buildRisks(),
      };
      resolve({ ok: true, draft });
    }, delay);
  });
}

export const SAMPLE_REVIEWS = [
  "房间很干净，晚上很安静，窗外能看到山，老板回复消息很及时。我们带孩子住了两晚，整体很放松，去周边逛也方便。下次来大理还会考虑这里。",
];
