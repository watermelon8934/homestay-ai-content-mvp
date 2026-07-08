import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultView, assembleFullNote } from "@/components/ResultView";
import { copyText } from "@/components/CopyButton";
import { toast } from "sonner";
import type { NoteDraft } from "@/lib/types";
import { getHistoryItem } from "@/lib/storage";

export const Route = createFileRoute("/history/$id")({
  head: () => ({
    meta: [
      { title: "历史详情｜民宿 AI 内容增长工具" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryDetailPage,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 pt-16 text-center">
      <p className="text-sm text-muted-foreground">找不到这条记录</p>
      <Link to="/history" className="mt-4 inline-block text-sm text-primary">
        返回历史
      </Link>
    </div>
  );
}

function HistoryDetailPage() {
  const { id } = useParams({ from: "/history/$id" });
  const [draft, setDraft] = useState<NoteDraft | null | undefined>(undefined);
  const [mainIdx, setMainIdx] = useState(0);

  useEffect(() => {
    setDraft(getHistoryItem(id) ?? null);
  }, [id]);

  if (draft === undefined) return null;
  if (!draft) return <NotFound />;

  const mainTitle = draft.titles[mainIdx] ?? draft.titles[0];

  async function handleCopyAll() {
    if (!draft) return;
    const ok = await copyText(assembleFullNote(draft, mainTitle));
    if (ok) toast.success("已复制整篇笔记");
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-40 pt-4">
      <div className="mb-4">
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          返回历史
        </Link>
      </div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold">
          {draft.property.name || "笔记草稿"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(draft.createdAt).toLocaleString("zh-CN")}
        </p>
      </div>

      <ResultView draft={draft} mainIdx={mainIdx} onMainIdx={setMainIdx} />

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-3">
          <Button className="w-full" onClick={handleCopyAll}>
            <Copy className="mr-1.5 h-4 w-4" />
            复制整篇笔记
          </Button>
        </div>
      </div>
    </div>
  );
}
