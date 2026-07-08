import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const projectDir = path.resolve(appDir, "..");
const outputDir = path.join(projectDir, "samples", "firecrawl");

await loadLocalEnv(path.join(appDir, ".env.local"));

const args = parseArgs(process.argv.slice(2));
const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

if (!apiKey) {
  exitWithHelp("缺少 FIRECRAWL_API_KEY。请先把 Firecrawl API Key 填到 app/.env.local。");
}

if (!args.query && !args.url) {
  exitWithHelp("请提供 --query 或 --url。");
}

await mkdir(outputDir, { recursive: true });

if (args.query) {
  const result = await firecrawlSearch({
    query: args.query,
    limit: Number(args.limit ?? 5),
    scrape: args.scrape === "true",
  });
  await saveResult("search", args.query, result);
}

if (args.url) {
  const result = await firecrawlScrape(args.url);
  await saveResult("scrape", args.url, result);
}

async function firecrawlSearch({ query, limit, scrape }) {
  const body = {
    query,
    limit,
    sources: ["web"],
    country: "CN",
  };

  if (scrape) {
    body.scrapeOptions = {
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 60000,
      removeBase64Images: true,
    };
  }

  return firecrawlFetch("/search", body);
}

async function firecrawlScrape(url) {
  return firecrawlFetch("/scrape", {
    url,
    formats: ["markdown", "links"],
    onlyMainContent: true,
    timeout: 60000,
    removeBase64Images: true,
  });
}

async function firecrawlFetch(endpoint, body) {
  const response = await fetch(`https://api.firecrawl.dev/v2${endpoint}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      `Firecrawl 请求失败：${response.status}\n${JSON.stringify(json, null, 2)}`,
    );
  }
  return json;
}

async function saveResult(kind, input, result) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeName = input
    .replace(/^https?:\/\//, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const jsonPath = path.join(outputDir, `${stamp}-${kind}-${safeName}.json`);
  const mdPath = path.join(outputDir, `${stamp}-${kind}-${safeName}.md`);

  await writeFile(jsonPath, JSON.stringify(result, null, 2), "utf8");
  await writeFile(mdPath, toSampleMarkdown(kind, input, result), "utf8");

  console.log(`已保存 JSON：${jsonPath}`);
  console.log(`已保存 Markdown：${mdPath}`);
}

function toSampleMarkdown(kind, input, result) {
  const lines = [
    `# Firecrawl ${kind === "search" ? "搜索" : "抽取"}结果`,
    "",
    `- 输入：${input}`,
    `- 时间：${new Date().toLocaleString("zh-CN")}`,
    `- Credits：${result.creditsUsed ?? "未知"}`,
    "",
  ];

  if (kind === "search") {
    const web = result.data?.web ?? [];
    lines.push("## 搜索结果", "");
    web.forEach((item, index) => {
      lines.push(`### ${index + 1}. ${item.title ?? "无标题"}`);
      lines.push("");
      lines.push(`- 链接：${item.url ?? ""}`);
      if (item.description) lines.push(`- 摘要：${item.description}`);
      if (item.markdown) {
        lines.push("", "#### Markdown 摘录", "");
        lines.push(item.markdown.slice(0, 1600));
      }
      lines.push("");
    });
  } else {
    const data = result.data ?? {};
    lines.push("## 页面内容", "");
    lines.push(`- 标题：${data.metadata?.title ?? "未知"}`);
    lines.push(`- 来源：${data.metadata?.sourceURL ?? data.metadata?.url ?? ""}`);
    lines.push("", "## Markdown", "");
    lines.push((data.markdown ?? "").slice(0, 5000));
  }

  lines.push(
    "",
    "## 人工拆解栏",
    "",
    "- 标题结构：",
    "- 开头方式：",
    "- 核心卖点：",
    "- 标签：",
    "- 图片结构：",
    "- 互动数据：",
    "- 可学习点：",
    "- 风险点：",
  );

  return lines.join("\n");
}

async function loadLocalEnv(envPath) {
  if (!existsSync(envPath)) return;
  const content = await readFile(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
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

function exitWithHelp(message) {
  console.error(message);
  console.error("");
  console.error("用法：");
  console.error("  node scripts/firecrawl-sample.mjs --query \"大理米糖的院子 小红书\" --limit 5");
  console.error("  node scripts/firecrawl-sample.mjs --query \"大理民宿 小红书\" --limit 5 --scrape true");
  console.error("  node scripts/firecrawl-sample.mjs --url \"https://example.com/page\"");
  process.exit(1);
}
