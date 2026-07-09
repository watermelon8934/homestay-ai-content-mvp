import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultView, assembleFullNote } from "@/components/ResultView";
import { copyText } from "@/components/CopyButton";
import { toast } from "sonner";
import type { NoteDraft } from "@/lib/types";
import {
  getCurrentDraft,
  setCurrentDraft,
  useHistory,
  useQuota,
} from "@/lib/storage";
import { generateNote } from "@/lib/generate";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "生成结果｜民宿 AI 内容增长工具" },
      { name: "description", content: "查看并复制生成好的小红书笔记草稿。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const navigate = useNavigate();
  const { remaining, exhausted, consume } = useQuota();
  const { add } = useHistory();
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [mainIdx, setMainIdx] = useState(0);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const d = getCurrentDraft();
    if (!d) {
      navigate({ to: "/" });
      return;
    }
    setDraft(d);
  }, [navigate]);

  if (!draft) return null;

  const mainTitle = draft.titles[mainIdx] ?? draft.titles[0];

  async function handleCopyAll() {
    if (!draft) return;
    const ok = await copyText(assembleFullNote(draft, mainTitle));
    if (ok) toast.success("整篇笔记已复制，去小红书粘贴吧");
    else toast.error("复制失败，请手动选择");
  }

  async function handleRegenerate() {
    if (!draft) return;
    if (exhausted) {
      toast.error("今日额度已用完，明天 0 点重置");
      return;
    }
    setRegenerating(true);
    const res = await generateNote(
      draft.reviewInput,
      draft.property,
      draft.reviewImages ?? [],
    );
    setRegenerating(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const nextDraft = { ...res.draft, reviewImages: draft.reviewImages };
    consume();
    add(nextDraft);
    setCurrentDraft(nextDraft);
    setDraft(nextDraft);
    setMainIdx(0);
    toast.success("已重新生成");
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-40 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回修改
        </Link>
        <span className="text-xs text-muted-foreground">
          今日剩余 {remaining} 次
        </span>
      </div>

      <div className="mb-4">
        <h1 className="text-lg font-semibold">生成完成</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {draft.property.name} · 主理人视角草稿
        </p>
      </div>

      <ResultView draft={draft} mainIdx={mainIdx} onMainIdx={setMainIdx} />

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-2.5">
          <div className="mb-2 rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-[11px] leading-5 text-muted-foreground">
            <p className="mb-0.5 font-medium text-foreground/80">发布前请确认</p>
            <p>· 图片与文字都是真实信息</p>
            <p>· 不补写未提供的设施、距离、价格、早餐等具体事实</p>
            <p>· 想加自家特色，请先补到「民宿资料」再重新生成</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRegenerate}
              disabled={regenerating || exhausted}
            >
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
              />
              重新生成
            </Button>
            <Button className="flex-[1.4]" onClick={handleCopyAll}>
              <Copy className="mr-1.5 h-4 w-4" />
              复制整篇笔记
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
