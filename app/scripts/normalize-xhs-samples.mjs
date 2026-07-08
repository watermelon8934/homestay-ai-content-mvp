import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const projectDir = path.resolve(appDir, "..");
const inputDir = path.join(projectDir, "samples", "xhs");
const outputDir = path.join(projectDir, "samples", "normalized");

await mkdir(outputDir, { recursive: true });

if (!existsSync(inputDir)) {
  throw new Error(`找不到输入目录：${inputDir}`);
}

const files = (await readdir(inputDir))
  .filter((file) => file.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.log("samples/xhs 里还没有 JSON 采集结果。");
  console.log("先运行：pnpm sample:xhs -- --query \"大理民宿\" --limit 8");
  process.exit(0);
}

const samples = [];

for (const file of files) {
  const fullPath = path.join(inputDir, file);
  const data = JSON.parse(await readFile(fullPath, "utf8"));
  const items = extractItems(data);

  for (const item of items) {
    samples.push({
      sourceFile: file,
      query: item.query ?? data.query ?? "未知",
      title: item.title ?? "",
      url: item.url ?? "",
      visibleText: item.visibleText ?? "",
      likes: item.likes ?? null,
      collects: item.collects ?? null,
      comments: item.comments ?? null,
    });
  }
}

const deduped = dedupeByUrl(samples);
const outputPath = path.join(outputDir, "xhs-sample-review.md");
await writeFile(outputPath, toMarkdown(deduped), "utf8");

console.log(`已整理 ${deduped.length} 条样本：${outputPath}`);

function extractItems(data) {
  if (Array.isArray(data.page?.items)) {
    return data.page.items.map((item) => ({
      ...item,
      query: item.query ?? data.query ?? "未知",
    }));
  }
  if (Array.isArray(data.pages)) {
    return data.pages.flatMap((page) =>
      (page.items ?? []).map((item) => ({
        ...item,
        query: item.query ?? page.query ?? data.query ?? "未知",
      })),
    );
  }
  return [];
}

function dedupeByUrl(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = item.url || `${item.query}-${item.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function toMarkdown(items) {
  const lines = [
    "# 小红书民宿样本整理草稿",
    "",
    `- 生成时间：${new Date().toLocaleString("zh-CN")}`,
    `- 样本数：${items.length}`,
    "",
    "## 使用方式",
    "",
    "逐条补充拆解栏：标题结构、开头方式、核心卖点、标签、图片结构、可学习点、风险点。",
    "完成后，可把高分样本迁移到 `docs/真实民宿样本库.md`。",
    "",
  ];

  items.forEach((item, index) => {
    lines.push(`## ${index + 1}. ${item.title || "未识别标题"}`);
    lines.push("");
    lines.push(`- 查询词：${item.query}`);
    lines.push(`- 来源文件：${item.sourceFile}`);
    lines.push(`- 链接：${item.url || "未识别"}`);
    lines.push(`- 点赞：${item.likes ?? "未识别"}`);
    lines.push(`- 收藏：${item.collects ?? "未识别"}`);
    lines.push(`- 评论：${item.comments ?? "未识别"}`);
    lines.push(`- 可见文本：${item.visibleText || "无"}`);
    lines.push("");
    lines.push("### 拆解");
    lines.push("");
    lines.push("- 标题结构：");
    lines.push("- 开头方式：");
    lines.push("- 核心卖点：");
    lines.push("- 标签：");
    lines.push("- 图片结构：");
    lines.push("- 评论区咨询信号：");
    lines.push("- 可学习点：");
    lines.push("- 风险点：");
    lines.push("- 是否适合作为 few-shot：待定");
    lines.push("");
  });

  return lines.join("\n");
}
