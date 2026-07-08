# Lovable MVP 原型提示词

## 1. Project Knowledge

把下面内容放到 Lovable 的 Project settings -> Knowledge。

```text
Project overview
This project is a Chinese MVP prototype for "民宿 AI 内容增长工具", an AI content creation tool for small homestay owners with about 5-10 rooms.

The product helps busy homestay owners paste positive OTA guest reviews and generate copy-ready Xiaohongshu notes, including title options, body text, hashtags, image suggestions, and compliance reminders.

This is an independent homestay/content-growth product. Do not reference other industries, unrelated SaaS products, laundry businesses, CRM businesses, hotel chains, or enterprise marketing systems.

Primary users
- Small homestay owners in China.
- They usually have no content operation staff.
- They are busy and need a simple "paste review -> generate note -> copy and publish" workflow.
- They may use the app on mobile.

MVP scope
- Users can fill basic homestay profile information.
- Users can paste OTA guest reviews as plain text.
- The app generates Xiaohongshu note drafts.
- Output includes 3-5 title options, one body, 8-15 hashtags, 3-6 image suggestions, evidence summary, and compliance warnings.
- Show a daily quota: max 5 successful generations per account per day.
- Failed generation does not consume quota.
- Regeneration consumes quota.
- For the prototype, use mocked AI generation and sample data unless explicitly asked to connect real backend or AI APIs.

Content principles
- Use homestay owner or content operator viewpoint.
- Do not pretend to be a real guest.
- Do not use phrases like "我刚住过", "亲测", or "刚退房".
- Do not invent specific facts not provided by the user.
- Avoid extreme claims, absolute promises, false rankings, fake prices, fake distances, and over-marketing.
- Missing information should appear as a warning or suggestion, not as a fact.

Core user journey
1. User sees a warm, clear product page explaining the tool.
2. User starts the workflow.
3. User fills or confirms homestay profile.
4. User pastes OTA positive reviews.
5. User optionally chooses target audience or focus.
6. User clicks generate.
7. App shows generation progress states.
8. App displays generated titles, body, hashtags, image suggestions, evidence, and warnings.
9. User can copy each part or copy the full note.
10. User can view generation history.

Design direction
- Chinese interface.
- Warm, trustworthy, calm, practical, and mobile-first.
- It should feel like a lightweight content creation workspace for small homestay owners, not a heavy enterprise dashboard.
- Use realistic Chinese copy, no lorem ipsum.
- Use clean spacing, readable typography, and practical controls.
- The workbench should be quiet and efficient.
- Use icons where helpful.
- Avoid overdecorated marketing-page style.
- Avoid fake social media feed communities.

Suggested pages
- Home/About page
- Onboarding/Profile setup
- Generate workspace
- Generation result
- History
- Settings or quota area, only if needed

Technical preference
- React + TypeScript.
- Tailwind CSS.
- shadcn/ui components if available.
- Keep components modular.
- Use mock data first.
- Do not connect real AI APIs or databases in the first prototype unless asked.
```

## 2. Plan Mode：先拆页面和流程

```text
We are building a Chinese MVP prototype for "民宿 AI 内容增长工具".

Use Plan mode only. Do not implement yet.

Based on the project knowledge, create a product prototype plan for a mobile-first web app that helps small homestay owners paste OTA positive reviews and generate Xiaohongshu notes.

Please include:
1. Information architecture.
2. Page list.
3. Main user flow from first visit to copied generated note.
4. Key UI components on each page.
5. Empty, loading, success, failure, and quota-exceeded states.
6. Which parts should use mock data in the first prototype.
7. A recommended build sequence.

Keep the MVP focused. The core action is: paste review -> generate note -> copy.
Ask me any questions you need before finalizing the plan.
```

## 3. Build Mode：生成首版 MVP 原型

```text
Build the first clickable MVP prototype based on the approved plan.

Important constraints:
- Chinese UI.
- Mobile-first, but responsive on desktop.
- Use mocked AI generation only.
- Do not connect real AI APIs, Supabase, Lovable Cloud, authentication, payments, or scraping yet.
- Focus on the core workflow: product intro -> homestay profile -> paste OTA reviews -> generate -> result -> copy -> history.

Design style:
- Warm, trustworthy, calm, practical.
- Lightweight content creation workspace for small homestay owners.
- Clean typography and spacing.
- Use realistic Chinese copy.
- Avoid generic lorem ipsum.
- Avoid heavy enterprise dashboard style.
- Avoid over-marketing.

Functional requirements:
- Home/About page with clear value proposition and a primary CTA: "开始生成笔记".
- Profile setup form with fields:
  - 民宿名称
  - 城市/景区
  - 房间数量
  - 主要卖点
  - 适合人群
  - 小红书主页（可选）
- Review paste page with a large textarea for OTA reviews.
- Optional controls for focus:
  - 本次重点：干净、安静、亲子、情侣、景区周边、服务贴心
  - 内容长度：短、中、长
- Generate button.
- Show daily quota: 今日还可成功生成 5 次.
- Simulate generation progress with three steps:
  1. 正在提取好评亮点
  2. 正在组织小红书表达
  3. 正在检查事实和风险
- Result page with:
  - 3 title options
  - selected title
  - body text
  - hashtags
  - image suggestions
  - evidence summary
  - compliance warnings
  - copy buttons for title, body, hashtags, and full note
  - regenerate button
- History page with a list of generated notes.
- Include failure and quota-exceeded UI states with realistic Chinese messages.

Mock output must follow the content rules:
- Use homestay owner/content operator perspective.
- Do not pretend to be a guest.
- Do not invent specific distance, price, ranking, breakfast, facilities, or scenery unless provided.
- Include compliance warnings when info is missing.

After building, verify the main flow works in preview.
```

## 4. 关于页/首页专项打磨 Prompt

```text
Redesign the Home/About page only.

Goal:
Make the first screen immediately communicate that this is an AI tool for small homestay owners to turn OTA positive reviews into copy-ready Xiaohongshu notes.

Audience:
Busy small homestay owners with 5-10 rooms. They do not have content operation staff and want a fast, low-effort workflow.

Keep:
- Existing app routes and core workflow.
- Primary CTA leading to the generation workflow.
- Chinese UI.

Page structure:
1. First viewport:
   - Clear headline: "把 OTA 好评，一键整理成小红书笔记"
   - Short supporting copy: "适合 5-10 间房的小民宿老板。粘贴住客好评，生成标题、正文、话题和配图建议。"
   - Primary CTA: "开始生成笔记"
   - Secondary text link: "先看示例"
   - A realistic product preview panel showing a pasted review becoming a note draft.
2. Trust/fit section:
   - Three concise points:
     - 不伪装游客
     - 不编造事实
     - 失败不扣额度
3. Workflow section:
   - Three steps:
     - 粘贴好评
     - 生成笔记
     - 复制发布
4. Example section:
   - Show a small before/after example using realistic Chinese homestay review text.

Design:
- Warm, trustworthy, calm, practical.
- Do not make it look like a generic startup landing page.
- Avoid huge decorative gradients.
- Use a clean workspace/product preview visual rather than abstract illustrations.
- Keep mobile layout polished and compact.
```

## 5. 工作台专项打磨 Prompt

```text
Improve the Generate Workspace page only.

Make it feel like a focused writing tool for busy homestay owners.

Requirements:
- Keep the main action visible: paste OTA review and click generate.
- Use a two-area layout on desktop:
  - Left: homestay profile summary and quota.
  - Right: review input and generation options.
- On mobile, stack sections naturally with the generate button easy to reach.
- Add helper text that is practical, not instructional clutter.
- Add sample review insertion button: "填入示例好评".
- Add validation:
  - If review text is empty, show "请先粘贴至少一条住客好评".
  - If quota is 0, disable generate and show quota exceeded state.
- Keep all copy in Chinese.
- Avoid adding real API calls.
```

## 6. 结果页专项打磨 Prompt

```text
Improve the Generation Result page only.

Goal:
The owner should immediately know what to copy and why the content is safe.

Layout:
- Top: selected title and full note copy button.
- Then title alternatives as selectable chips/cards.
- Then body text in a readable editor-like panel.
- Then hashtags with copy button.
- Then image suggestions.
- Then evidence summary and compliance warnings.

Details:
- Make copy buttons obvious and reliable.
- Show a toast after copying, such as "已复制，可去小红书粘贴".
- Use calm warning style for compliance warnings, not scary error styling.
- Add a regenerate button, with text explaining "重新生成会消耗 1 次额度".
- Keep mocked data.
- Keep Chinese UI.
```
