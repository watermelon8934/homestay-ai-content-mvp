import type { NoteDraft, Property } from "./types";

// 说明：本原型使用固定的安全示例输出，仅使用用户提供或好评明确提到的信息。
// 严禁出现未提供的场景细节（森林、山谷、虫鸣、山脚下、徒步、院子、露台、
// 茶壶、木椅、木、麻、石 等）。

const FIXED_TITLES = [
  "大理古城里，住得省心一点",
  "住在古城东门附近的小院日常",
  "来大理住两晚，慢一点也好",
  "大理小院的几件日常小事",
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

function hasAny(review: string, words: string[]): boolean {
  return words.some((word) => review.includes(word));
}

function buildBody(property: Property, review: string): string {
  const city = property.city || "大理";
  const name = property.name || "山间小院";
  const locationText = hasAny(review, ["东门", "古城", "位置", "出行", "外卖"])
    ? "我们在古城附近，出门逛、打车和点外卖都比较省心。来大理的几天，如果不用把时间都耗在路上，人会轻松很多。"
    : `我们在${city}，一直想把住宿里那些不夸张但实用的小细节做好。`;
  const stayText = hasAny(review, ["干净", "收拾", "卫生", "房间"])
    ? "房间每天认真收拾，床品和卫浴这些基础细节，我们会反复确认。住下来觉得舒服，比一句漂亮宣传更重要。"
    : "我们希望客人住下来的几天，不用把太多精力花在住宿上，可以慢一点安排自己的行程。";
  const ownerText = hasAny(review, ["老板", "服务", "回复", "小甜品", "热情"])
    ? "消息看到会尽量及时回，房间也会认真收拾好。很多经营里的小动作，其实都是希望大家到店后少一点陌生感。"
    : "能让住客觉得放松，对我们来说就是很重要的反馈。";

  return [
    `${name}想分享的，是住下来会慢慢被注意到的几个日常细节。`,
    "",
    locationText,
    "",
    stayText,
    "",
    ownerText,
    "",
    `如果你来${city}，也想住得舒服、出门方便、沟通顺一点，可以看看这里是不是适合你的行程。`,
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
      const body = buildBody(property, review);

      const rationale = [
        "本示例采用民宿自营账号口吻：用住客反馈里的事实，转成店铺自己的日常介绍。",
        "未使用点评分析口吻，未使用长引用，也没有伪装成游客入住。",
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
