# 免费样本采集方案

## 推荐方案

验证阶段先使用：

```text
Crawlee + Playwright
```

它们都是开源工具，不需要 Firecrawl API Key。

## 为什么不用纯搜索引擎

小红书内容在普通搜索引擎里收录不稳定，很多笔记标题可以搜到，但正文、互动数、图片结构经常拿不到。

## 为什么不用 Scrapy 优先

Scrapy 很成熟，但更适合传统 HTML 页面。小红书这类重前端页面更适合用真实浏览器渲染，所以优先 Playwright。

## 验证目标

第一版免费采样工具只做：

- 输入关键词
- 打开小红书搜索页
- 读取可见结果标题
- 记录链接
- 尽量记录点赞/收藏/评论等可见信息
- 保存为 JSON / Markdown

暂不做：

- 大规模采集
- 自动登录
- 自动互动
- 绕过验证码或风控
- 抓取不可公开访问的数据

## 当前实现

已安装：

```bash
crawlee
playwright
```

已新增两个脚本：

```text
scripts/xhs-crawlee-sample.mjs
scripts/xhs-playwright-sample.mjs
```

输出目录：

```text
samples/xhs/
```

样本整理：

```bash
pnpm sample:normalize
```

整理后的文件：

```text
samples/normalized/xhs-sample-review.md
```

试运行：

```bash
pnpm sample:xhs -- --query "大理民宿" --limit 8
pnpm sample:xhs -- --query "大理米糖的院子" --limit 8
```

如果不希望弹出浏览器窗口，可加：

```bash
pnpm sample:xhs -- --query "大理民宿" --limit 8 --headless true
```

说明：

- `sample:xhs` 使用轻量 Playwright 脚本，优先用于当前验证。
- `sample:xhs:crawlee` 使用 Crawlee 脚本；当前本地环境可能因系统进程权限限制失败。
- `sample:normalize` 会把 `samples/xhs` 里的 JSON 结果整理成统一的样本拆解草稿。
- 在 Codex 沙盒里直接启动新 Chrome 进程可能被系统拦截；建议在你电脑的普通终端里运行上述命令。
