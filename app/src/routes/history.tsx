import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/lib/storage";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "历史记录｜民宿 AI 内容增长工具" },
      { name: "description", content: "查看本地保存的历次笔记生成结果。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const hm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (sameDay) return `今天 ${hm}`;
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`;
}

function HistoryPage() {
  const { history, remove, loaded } = useHistory();

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      <header className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">历史记录</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          本地保存最近 20 条生成结果，仅存于本设备
        </p>
      </header>

      {history.length === 0 ? (
        <div className="mt-12 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            还没有生成记录
          </p>
          <p className="mt-1.5 max-w-[16rem] text-xs leading-5 text-muted-foreground">
            生成过的笔记会自动保存在这里，方便下次复用、对比不同版本，
            或者把好的一版重新复制发布。
          </p>
          <Link to="/" className="mt-5">
            <Button size="sm">去工作台生成第一篇</Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {history.map((h) => (
            <li key={h.id}>
              <Card className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate font-medium text-foreground/80">
                      {h.property.name || "未命名民宿"}
                    </span>
                    {h.property.city && (
                      <>
                        <span>·</span>
                        <span className="truncate">{h.property.city}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="whitespace-nowrap">
                      {formatTime(h.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("删除这条记录？")) remove(h.id);
                    }}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="删除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <Link to="/history/$id" params={{ id: h.id }}>
                  <p className="line-clamp-2 text-sm font-medium leading-6 text-foreground">
                    {h.titles[0]}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {h.body.replace(/\n+/g, " ")}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {h.tags.length} 个标签 · {h.titles.length} 个备选标题
                    </span>
                    <span className="text-xs font-medium text-primary">
                      继续查看 →
                    </span>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
