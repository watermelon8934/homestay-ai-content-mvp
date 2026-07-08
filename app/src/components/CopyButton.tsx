import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label = "复制",
  size = "sm",
  variant = "outline",
  className,
}: {
  text: string;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={async (e) => {
        e.stopPropagation();
        const success = await copyText(text);
        if (success) {
          setOk(true);
          toast.success("已复制");
          setTimeout(() => setOk(false), 1200);
        } else {
          toast.error("复制失败，请手动选择文本");
        }
      }}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      <span className="ml-1">{ok ? "已复制" : label}</span>
    </Button>
  );
}
