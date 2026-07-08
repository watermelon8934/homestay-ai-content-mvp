import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  ListChecks,
  ShieldCheck,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "使用说明｜民宿 AI 内容增长工具" },
      {
        name: "description",
        content:
          "了解本工具能做什么、老板怎么用、内容原则以及后续规划中的公开回访能力。",
      },
      { property: "og:title", content: "使用说明与产品原则" },
      {
        property: "og:description",
        content:
          "把住客好评整理成小红书笔记草稿；主理人视角，不编造事实。",
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          使用说明 · 关于
        </h1>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          民宿 AI 内容增长工具 · 面向 5–10 间房的小体量民宿主理人
        </p>
      </header>

      {/* 1. 这个工具做什么 */}
      <Card className="mb-4 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">这个工具做什么</h2>
        </div>
        <p className="text-sm leading-6 text-foreground/90">
          把 OTA 平台上的住客好评，整理成可以直接复制发布的小红书笔记草稿：
          标题、正文、话题标签、配图建议、生成依据和内容风险提醒，一次给齐。
        </p>
      </Card>

      {/* 2. 老板怎么用 */}
      <Card className="mb-4 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">老板怎么用</h2>
        </div>
        <ol className="space-y-2.5">
          {[
            { n: "1", t: "填写民宿资料", d: "民宿名和城市即可，其他可选" },
            { n: "2", t: "粘贴 OTA 好评", d: "从携程、飞猪、美团等复制过来" },
            { n: "3", t: "生成笔记", d: "系统给出标题、正文、标签和配图建议" },
            { n: "4", t: "复制发布", d: "一键复制整篇，粘到小红书即可" },
          ].map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{s.t}</p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 rounded-md bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
          每台设备每天最多 5 次成功生成，失败不扣额度，重新生成算一次。
          历史仅保存在本设备。
        </p>
      </Card>

      {/* 3. 内容原则 */}
      <Card className="mb-4 p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold">内容原则</h2>
        </div>
        <ul className="space-y-2 text-sm leading-6 text-foreground/90">
          <li>· 使用民宿主 / 内容运营视角，认真回应住客留言</li>
          <li>
            · 不伪装游客真实入住，不使用「我刚住过」「亲测」「刚退房」等表达
          </li>
          <li>· 不编造好评未提到的价格、距离、早餐、设施、景观、宠物政策</li>
          <li>· 避免「最」「第一」「绝对」「独家」等极限词与虚假承诺</li>
          <li>· 未提供的信息进入风险提醒或配图建议，不写成确定事实</li>
        </ul>
      </Card>

      {/* 4. 后续会做什么 */}
      <Card className="border-dashed p-4">
        <div className="mb-2 flex items-center gap-2">
          <Compass className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">后续会做什么</h2>
          <span className="ml-auto rounded-full border border-dashed border-muted-foreground/40 px-2 py-0.5 text-[10px] text-muted-foreground">
            规划中
          </span>
        </div>
        <ul className="space-y-2 text-sm leading-6 text-foreground/90">
          <li>· 公开搜索回访你已发布的小红书笔记</li>
          <li>· 记录点赞、收藏、评论等公开互动数据</li>
          <li>· 用真实反馈反哺下一次生成，让笔记越写越准</li>
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          以上为后续能力，当前版本尚未上线，不会读取任何账号数据。
        </p>
      </Card>
    </div>
  );
}
