import { AlertTriangle, Info } from "lucide-react";
import type { NoteDraft } from "@/lib/types";
import { CopyButton, copyText } from "./CopyButton";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export function assembleFullNote(draft: NoteDraft, mainTitle: string) {
  return [mainTitle, "", draft.body, "", draft.tags.join(" ")].join("\n");
}

export function ResultView({
  draft,
  mainIdx,
  onMainIdx,
}: {
  draft: NoteDraft;
  mainIdx: number;
  onMainIdx: (i: number) => void;
}) {
  return (
    <div className="space-y-5 pb-4">
      {/* 发布预览 */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">发布预览</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            图片和文案放在一起，发布前先整体看一眼。
          </p>
        </div>
        {draft.reviewImages && draft.reviewImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-1 bg-muted p-1">
            {draft.reviewImages.slice(0, 4).map((image, i) => (
              <div key={image.id} className="relative bg-background">
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="aspect-square w-full object-cover"
                />
                {i === 3 && draft.reviewImages!.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-medium text-white">
                    +{draft.reviewImages!.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-muted px-6 text-center text-xs leading-6 text-muted-foreground">
            未上传图片时，发布前可按配图建议补充真实图片。
          </div>
        )}
        <div className="space-y-3 p-4">
          <h2 className="text-base font-semibold leading-6">
            {draft.titles[mainIdx] ?? draft.titles[0]}
          </h2>
          <p className="line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
            {draft.body}
          </p>
          <p className="line-clamp-2 text-xs leading-5 text-primary">
            {draft.tags.join(" ")}
          </p>
        </div>
      </Card>

      {/* 标题备选 */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">标题备选</h3>
          <span className="text-xs text-muted-foreground">
            点选一个作为主标题
          </span>
        </div>
        <ul className="space-y-2">
          {draft.titles.map((t, i) => {
            const active = i === mainIdx;
            return (
              <li
                key={i}
                className={`flex items-start gap-2 rounded-lg border p-3 transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background"
                }`}
              >
                <button
                  onClick={() => onMainIdx(i)}
                  className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary"
                  aria-label="选为主标题"
                >
                  {active && (
                    <span className="block h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
                <p className="flex-1 text-sm leading-relaxed">{t}</p>
                <CopyButton text={t} label="复制" />
              </li>
            );
          })}
        </ul>
      </Card>

      {/* 正文 */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">正文</h3>
          <CopyButton text={draft.body} label="复制正文" />
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
          {draft.body}
        </p>
      </Card>

      {/* 标签 */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            话题标签
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({draft.tags.length})
            </span>
          </h3>
          <CopyButton text={draft.tags.join(" ")} label="复制全部" />
        </div>
        <div className="flex flex-wrap gap-2">
          {draft.tags.map((tag) => (
            <button
              key={tag}
              onClick={async () => {
                const ok = await copyText(tag);
                if (ok) toast.success(`已复制 ${tag}`);
              }}
              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:border-primary hover:bg-primary/10"
            >
              {tag}
            </button>
          ))}
        </div>
      </Card>

      {/* 配图建议 */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">配图建议</h3>
        <ol className="space-y-2 text-sm text-foreground/90">
          {draft.imageIdeas.map((idea, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              <span className="leading-6">{idea}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* 风险提醒 */}
      <Card className="border-amber-300/60 bg-amber-50/60 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            内容风险提醒
          </h3>
        </div>
        <ul className="space-y-1.5 text-xs leading-6 text-amber-900/90 dark:text-amber-100/90">
          {draft.risks.map((r, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-amber-700 dark:text-amber-400">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 生成依据 */}
      <Accordion type="single" collapsible>
        <AccordionItem value="rationale" className="rounded-lg border px-4">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              生成依据
            </span>
          </AccordionTrigger>
          <AccordionContent className="whitespace-pre-wrap text-xs leading-6 text-muted-foreground">
            {draft.rationale}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
