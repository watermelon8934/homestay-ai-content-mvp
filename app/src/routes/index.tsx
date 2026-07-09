import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  Sparkles,
  Loader2,
  RefreshCw,
  Wand2,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  useProperty,
  useQuota,
  useHistory,
  setCurrentDraft,
} from "@/lib/storage";
import { SAMPLE_REVIEWS } from "@/lib/mock-generate";
import { generateNote } from "@/lib/generate";
import { filesToUploadedImages } from "@/lib/image-upload";
import type { UploadedImage } from "@/lib/types";
import { FlowSteps } from "@/components/FlowSteps";

const EXAMPLE_NAME = "山间小院";
const EXAMPLE_CITY = "大理";
const EXAMPLE_REVIEW =
  "房间很干净，晚上很安静，窗外能看到山，老板回复消息很及时。我们带孩子住了两晚，整体很放松，去周边逛也方便。下次来大理还会考虑这里。";
const DEFAULT_PROPERTY_NAME = "我的民宿";
const DEFAULT_PROPERTY_CITY = "未填写城市";

export const Route = createFileRoute("/")({

  head: () => ({
    meta: [
      { title: "民宿 AI 内容增长工具｜把住客好评变成小红书笔记" },
      {
        name: "description",
        content:
          "面向小体量民宿主理人的内容工作台：粘贴住客好评，一键生成小红书标题、正文、话题标签、配图建议与内容风险提醒。",
      },
      { property: "og:title", content: "民宿 AI 内容增长工具" },
      {
        property: "og:description",
        content: "粘贴好评，生成小红书笔记草稿。移动端优先，专为小体量民宿。",
      },
    ],
  }),
  component: Workbench,
});

function Workbench() {
  const navigate = useNavigate();
  const { property, update, loaded: pLoaded } = useProperty();
  const { remaining, limit, exhausted, consume, loaded: qLoaded } = useQuota();
  const { add } = useHistory();

  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [reviewImages, setReviewImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openMore, setOpenMore] = useState(false);

  const canSubmit = review.trim().length >= 30 && !exhausted && !loading;

  const isEmpty =
    !property.name && !property.city && !review && reviewImages.length === 0;

  function fillCompleteExample() {
    setError(null);
    update({ name: EXAMPLE_NAME, city: EXAMPLE_CITY });
    setReview(EXAMPLE_REVIEW);
    toast.info("已填入完整示例，可直接点击生成");
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files?.length) return;
    setImageLoading(true);
    try {
      const { images, skipped } = await filesToUploadedImages(
        files,
        reviewImages.length,
      );
      setReviewImages((prev) => [...prev, ...images]);
      if (images.length > 0) toast.success(`已添加 ${images.length} 张图片`);
      if (skipped > 0) toast.info("最多可上传 6 张图片");
    } catch {
      toast.error("图片读取失败，请换一张试试");
    } finally {
      setImageLoading(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    if (review.trim().length < 30) {
      setError("先粘贴一段好评文字，至少 30 个字。");
      return;
    }
    if (exhausted) {
      setError("今日额度已用完，明天 0 点自动重置");
      return;
    }

    setLoading(true);
    const requestProperty = {
      ...property,
      name: property.name.trim() || DEFAULT_PROPERTY_NAME,
      city: property.city.trim() || DEFAULT_PROPERTY_CITY,
    };
    const res = await generateNote(review.trim(), requestProperty, reviewImages);
    setLoading(false);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const draft = { ...res.draft, property: requestProperty, reviewImages };
    consume();
    add(draft);
    setCurrentDraft(draft);
    navigate({ to: "/result" });
  }

  if (!pLoaded || !qLoaded) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-6">
      {/* 顶部欢迎 + 额度 */}
      <header className="mb-5">
        <div className="mb-1 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">一键生成笔记</h1>
          <QuotaBadge remaining={remaining} limit={limit} />
        </div>
        <p className="text-xs leading-6 text-muted-foreground">
          粘贴好评、上传图片，生成可复制的小红书笔记。
          <br />
          老板只管丢素材，系统负责整理。
        </p>
      </header>

      <FlowSteps />

      {/* 首次体验引导 */}
      {isEmpty && (
        <Card className="mb-5 border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Wand2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                首次体验？一键填入完整示例
              </p>
              <p className="mb-3 text-xs leading-5 text-muted-foreground">
                包含民宿名、城市和一段真实风格的好评，点一下即可看到生成效果。
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={fillCompleteExample}
              >
                <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                填入完整示例
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 素材输入 */}
      <Card className="mb-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">把素材丢进来</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              粘贴好评文字，再上传准备发布的图片。
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {review.length}/800
          </span>
        </div>

        <div className="space-y-3">
          <Textarea
            value={review}
            onChange={(e) => setReview(e.target.value.slice(0, 800))}
            placeholder="把携程/美团/飞猪上的好评文字粘到这里。"
            className="min-h-[170px] resize-none text-sm leading-6"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                const pick =
                  SAMPLE_REVIEWS[
                    Math.floor(Math.random() * SAMPLE_REVIEWS.length)
                  ];
                setReview(pick);
              }}
              className="text-xs text-primary hover:underline"
            >
              <RefreshCw className="mr-1 inline h-3 w-3" />
              填入示例好评
            </button>
            {review && (
              <button
                onClick={() => setReview("")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                清空文字
              </button>
            )}
          </div>
        </div>

        <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:border-primary hover:bg-primary/5">
          <ImagePlus className="mb-2 h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            {imageLoading ? "正在添加图片…" : "上传图片"}
          </span>
          <span className="mt-1 text-xs leading-5 text-muted-foreground">
            可多选，最多 6 张。系统会把图片和文案放在一起整理。
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={imageLoading || reviewImages.length >= 6}
            onChange={(e) => {
              void handleImageUpload(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>

        {reviewImages.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {reviewImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-md border bg-muted"
              >
                <img
                  src={image.dataUrl}
                  alt={image.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  aria-label="移除图片"
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow-sm"
                  onClick={() =>
                    setReviewImages((prev) =>
                      prev.filter((item) => item.id !== image.id),
                    )
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 民宿资料 */}
      <Card className="mb-5 p-4">
        <Collapsible open={openMore} onOpenChange={setOpenMore}>
          <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
            <div>
              <h2 className="text-sm font-semibold">补充民宿信息</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                可不填；填了民宿名和城市，标题会更像真实发布。
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${openMore ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-4">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                民宿名
              </label>
              <Input
                value={property.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="例：云朵情书客栈"
                maxLength={30}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                所在城市
              </label>
              <Input
                value={property.city}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="例：大理"
                maxLength={20}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                房型数
              </label>
              <Input
                value={property.roomCount ?? ""}
                onChange={(e) => update({ roomCount: e.target.value })}
                placeholder="例：5 间"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                卖点标签
              </label>
              <Input
                value={property.highlights ?? ""}
                onChange={(e) => update({ highlights: e.target.value })}
                placeholder="例：有院子、古城内、干湿分离"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">
                周边关键词
              </label>
              <Input
                value={property.surroundings ?? ""}
                onChange={(e) => update({ surroundings: e.target.value })}
                placeholder="例：古城东门、餐馆、小吃街"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <p className="mb-4 px-1 text-xs leading-5 text-muted-foreground">
        · 默认使用民宿主视角撰写，不伪装游客入住
        <br />
        · 不编造好评未提到的价格、距离、早餐等具体事实
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {exhausted && (
        <div className="mb-3 rounded-md border border-amber-300/60 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/5 dark:text-amber-200">
          今日 5 次生成额度已用完，明天 0 点自动重置。
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={!canSubmit}
        className="h-12 w-full text-base font-medium"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在整理住客的话…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            生成小红书笔记
          </>
        )}
      </Button>
    </div>
  );
}

function QuotaBadge({ remaining, limit }: { remaining: number; limit: number }) {
  const used = limit - remaining;
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
      <div className="flex gap-0.5">
        {Array.from({ length: limit }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < used ? "bg-muted-foreground/30" : "bg-primary"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium">
        今日 {remaining}/{limit}
      </span>
    </div>
  );
}
