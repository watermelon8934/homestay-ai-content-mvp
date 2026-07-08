# 民宿 AI 内容增长工具前端

这是「民宿 AI 内容增长工具」的前端 MVP。

当前定位：

- 前端使用 Vite + React。
- 后端后续使用 Java / Spring Boot。
- 模型 API Key 不放前端。

## 本地运行

```bash
npm install
npm run dev
```

## 后端地址

如果 Java 后端已经启动，可在 `.env.local` 中配置：

```env
VITE_API_BASE_URL=http://localhost:8081
```

如果不配置，前端会请求同域 `/api/generate-note`；请求失败时会自动使用本地示例生成，方便演示 MVP 流程。

## 构建

```bash
npm run build
```

构建产物：

```text
dist/
```
