# Lovable 原型工作流

## 1. 对 Lovable 机制的理解

Lovable 是自然语言驱动的全栈应用构建工具。它适合从一个清晰产品目标出发，快速生成 Web 应用原型，并继续通过对话迭代页面、组件、数据和交互。

对本项目最重要的机制：

- Plan mode：用于梳理方案、比较取舍、生成可审阅计划，不直接改代码。
- Build mode：用于实际生成和修改应用。
- Project Knowledge：项目级长期上下文，适合放产品定位、用户画像、设计原则、业务边界、术语和约束。
- Prompt 最佳实践：先规划用户旅程，再按组件或页面逐步生成；使用真实文案，不使用占位文本。
- Preview Toolbar：生成后可直接点选页面元素做局部修改。
- Backend：可用 Lovable Cloud 或 Supabase，支持数据库、认证、存储、边缘函数和 AI 能力。
- GitHub：需要代码所有权、后续接工程开发时，可连接 GitHub 双向同步。

## 2. 我们的使用策略

### 2.1 第一阶段先做高保真流程原型

先不追求真实 AI 接口，优先做完整可演示流程：

1. 首页/关于页：讲清楚工具给小民宿老板解决什么问题。
2. 新手引导：填写民宿基础资料。
3. 工作台：粘贴 OTA 好评。
4. 生成中状态：展示系统正在提取亮点、组织标题、检查风险。
5. 结果页：标题、正文、标签、配图建议、风险提醒、复制按钮。
6. 历史记录：查看过往生成内容。
7. 额度显示：每天 5 次成功生成，失败不扣。

第一版可以先用模拟数据和本地状态跑通体验，再接数据库和 AI。

### 2.2 提示词分层

不要把所有需求塞进一个超长提示词。建议分成：

1. Project Knowledge：一次性项目背景和长期规则。
2. 首轮原型 Prompt：让 Lovable 生成核心应用骨架。
3. 页面级 Prompt：逐页打磨，例如关于页、工作台、结果页。
4. 组件级 Prompt：局部打磨，例如生成结果卡片、复制按钮、额度提示。
5. 数据/后端 Prompt：后续接 Lovable Cloud 或 Supabase。

### 2.3 设计方向

本产品不是宏大宣传站，而是给忙碌民宿老板用的内容工具。视觉应：

- 温暖、可信、轻量。
- 有民宿/旅行内容感，但不要像旅游平台广告页。
- 首页可以有清楚的产品表达，但第一屏应尽快进入可用体验。
- 工作台应安静、直接、少干扰。
- 移动端体验要好，因为老板很可能在手机上复制评论和发布小红书。

建议关键词：

- warm professional
- calm but practical
- content creation workspace
- homestay lifestyle
- trustworthy
- mobile-first
- clean SaaS dashboard

避免：

- 过度营销的落地页。
- 大量空洞卡片。
- 复杂企业后台感。
- 伪装成游客分享社区。

## 3. Lovable 中建议的执行顺序

### 第一步：设置 Project Knowledge

把项目背景、用户、约束、设计原则放到 Project settings -> Knowledge。

### 第二步：Plan mode 先让它拆流程

让 Lovable 先输出信息架构、页面列表、用户流程和关键状态，不急着生成。

### 第三步：Build mode 生成首版

只要求它做前端原型和模拟生成，不接真实模型，不做登录也可以先跳过。

### 第四步：逐页打磨

优先打磨：

- 首页/关于页
- 好评粘贴工作台
- 生成结果页

### 第五步：再接数据

如果原型确认，再让 Lovable 加：

- 账号
- 民宿档案
- 生成记录
- 每日额度
- 历史内容

### 第六步：再接 AI

后续再通过 Edge Function 或自有 API 接入可切换模型层。

## 4. 关键提醒

- 每次只让 Lovable 做一个明确阶段。
- 页面文案要给真实中文内容。
- 复杂需求先用 Plan mode，确认后再 Build。
- 生成后优先用 Preview Toolbar 做局部调整。
- 后端和数据库不要太早复杂化，先验证老板使用流程。
- 真正上线前必须检查数据权限、RLS、API Key 和内容合规逻辑。

## 5. 参考文档

- https://docs.lovable.dev/introduction/welcome
- https://docs.lovable.dev/prompting/prompting-one
- https://docs.lovable.dev/features/plan-mode
- https://docs.lovable.dev/features/agent-mode
- https://docs.lovable.dev/features/knowledge
- https://docs.lovable.dev/features/preview-toolbar
- https://docs.lovable.dev/integrations/cloud
- https://docs.lovable.dev/integrations/supabase
- https://docs.lovable.dev/integrations/github
