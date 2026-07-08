import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PlaywrightCrawler } from "crawlee";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const projectDir = path.resolve(appDir, "..");
const outputDir = path.join(projectDir, "samples", "xhs");

const args = parseArgs(process.argv.slice(2));
const query = args.query ?? "大理民宿";
const limit = Number(args.limit ?? 10);
const headless = args.headless === "true";
const searchUrl =
  args.url ??
  `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(query)}&type=51`;

await mkdir(outputDir, { recursive: true });

const collected = [];

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 1,
  requestHandlerTimeoutSecs: 60,
  launchContext: {
    launcher: chromium,
    launchOptions: {
      channel: process.env.PW_CHANNEL || "chrome",
      headless,
    },
  },
  async requestHandler({ page, request, log }) {
    log.info(`打开页面：${request.loadedUrl ?? request.url}`);
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(6000);

    const samples = await page.evaluate((maxItems) => {
      const anchors = Array.from(document.querySelectorAll("a[href*='/search_result/']"));
      const seen = new Set();
      const items = [];

      for (const anchor of anchors) {
        const href = anchor.href;
        const title = (anchor.textContent || "").replace(/\s+/g, " ").trim();
        if (!href || seen.has(href)) continue;
        if (!title || title.length < 4) continue;
        seen.add(href);

        const card = anchor.closest("section, article, div");
        const text = (card?.textContent || anchor.parentElement?.textContent || "")
          .replace(/\s+/g, " ")
          .trim();

        items.push({
          title,
          url: href,
          visibleText: text.slice(0, 500),
          likes: extractMetric(text, ["赞", "点赞"]),
          collects: extractMetric(text, ["收藏"]),
          comments: extractMetric(text, ["评论"]),
        });

        if (items.length >= maxItems) break;
      }

      function extractMetric(text, labels) {
        for (const label of labels) {
          const match = text.match(new RegExp(`([0-9.]+万?|[0-9]+)\\s*${label}`));
          if (match) return match[1];
        }
        return null;
      }

      return {
        pageTitle: document.title,
        pageUrl: location.href,
        items,
      };
    }, limit);

    collected.push(samples);
  },
});

await crawler.run([searchUrl]);

const result = {
  query,
  sourceUrl: searchUrl,
  collectedAt: new Date().toISOString(),
  pages: collected,
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const safeName = query.replace(/[^\p{Letter}\p{Number}]+/gu, "-").slice(0, 40);
const jsonPath = path.join(outputDir, `${stamp}-${safeName}.json`);
const mdPath = path.join(outputDir, `${stamp}-${safeName}.md`);

await writeFile(jsonPath, JSON.stringify(result, null, 2), "utf8");
await writeFile(mdPath, toMarkdown(result), "utf8");

console.log(`已保存 JSON：${jsonPath}`);
console.log(`已保存 Markdown：${mdPath}`);

function toMarkdown(result) {
  const items = result.pages.flatMap((page) => page.items ?? []);
  const lines = [
    `# 小红书样本采集：${result.query}`,
    "",
    `- 来源：${result.sourceUrl}`,
    `- 时间：${result.collectedAt}`,
    `- 数量：${items.length}`,
    "",
    "## 搜索结果",
    "",
  ];

  items.forEach((item, index) => {
    lines.push(`### ${index + 1}. ${item.title}`);
    lines.push("");
    lines.push(`- 链接：${item.url}`);
    lines.push(`- 点赞：${item.likes ?? "未识别"}`);
    lines.push(`- 收藏：${item.collects ?? "未识别"}`);
    lines.push(`- 评论：${item.comments ?? "未识别"}`);
    lines.push(`- 可见文本：${item.visibleText || "无"}`);
    lines.push("");
    lines.push("拆解：");
    lines.push("- 标题结构：");
    lines.push("- 开头方式：");
    lines.push("- 核心卖点：");
    lines.push("- 标签：");
    lines.push("- 图片结构：");
    lines.push("- 可学习点：");
    lines.push("- 风险点：");
    lines.push("");
  });

  return lines.join("\n");
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
