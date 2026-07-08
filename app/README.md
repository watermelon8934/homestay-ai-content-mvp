# 民宿 AI 内容增长工具前端

这是从 Lovable 导出的本地 MVP 原型。

## 本地配置

复制或编辑 `.env.local`：

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的 DeepSeek API Key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

没有填写 `DEEPSEEK_API_KEY` 时，首页会自动使用本地示例生成，方便继续测试流程。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开终端显示的本地地址即可预览。
