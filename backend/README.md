# 民宿 AI 内容增长工具后端

这是 MVP 的 Java 后端，当前只做一件事：

```text
POST /api/generate-note
```

接口接收民宿资料和 OTA 好评，调用 DeepSeek，返回前端可以直接展示的小红书笔记草稿。

## 推荐方式：云端运行，本地浏览器验证

如果不想在私人电脑安装 JDK，可以把代码推到 GitHub，再把 `backend/` 部署到支持 Docker 的云平台，例如 Render、Railway、Fly.io 或云服务器。

云平台部署后端时使用：

```text
Root Directory: backend
Runtime: Docker
Dockerfile: Dockerfile
```

如果云平台要求从仓库根目录选择 Dockerfile，则选择：

```text
backend/Dockerfile
```

后端环境变量：

```text
DEEPSEEK_API_KEY=你的 DeepSeek API Key
APP_CORS_ALLOWED_ORIGINS=你的前端访问地址
```

部署成功后，在浏览器打开：

```text
https://你的后端域名/api/health
```

看到类似下面内容，就说明后端启动成功：

```json
{"ok":true,"service":"homestay-ai-backend"}
```

然后在前端部署平台配置：

```text
VITE_API_BASE_URL=https://你的后端域名
```

## 可选方式：本地运行

你的电脑需要先安装：

- JDK 17 或以上
- Maven

如果你暂时不想在本机安装 JDK，可以直接把代码推到 GitHub，再交给云平台用 Docker 构建和运行。

配置 DeepSeek Key：

```bash
export DEEPSEEK_API_KEY="你的 DeepSeek API Key"
```

启动后端：

```bash
cd backend
mvn spring-boot:run
```

默认地址：

```text
http://localhost:8081
```

前端 `.env.local` 使用：

```env
VITE_API_BASE_URL=http://localhost:8081
```

## 环境变量

```text
DEEPSEEK_API_KEY      必填，DeepSeek API Key
DEEPSEEK_BASE_URL     可选，默认 https://api.deepseek.com
DEEPSEEK_MODEL        可选，默认 deepseek-chat
DEEPSEEK_MAX_TOKENS   可选，默认 2200
DEEPSEEK_TEMPERATURE  可选，默认 0.7
```

## 密钥原则

模型 API Key 只放后端环境变量，不进入前端代码，不提交到 GitHub。
