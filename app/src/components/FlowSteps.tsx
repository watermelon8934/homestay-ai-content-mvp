const steps = [
  { n: "1", label: "粘贴好评" },
  { n: "2", label: "生成笔记" },
  { n: "3", label: "复制发布" },
  { n: "4", label: "回访优化", planned: true },
];

export function FlowSteps() {
  return (
    <div className="mb-5 rounded-lg border border-border bg-card/60 px-3 py-2.5">
      <ol className="flex items-center justify-between gap-1">
        {steps.map((s, i) => (
          <li key={s.n} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center gap-1">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${
                  s.planned
                    ? "border border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {s.n}
              </span>
              <span
                className={`text-[11px] leading-4 ${
                  s.planned ? "text-muted-foreground" : "text-foreground/80"
                }`}
              >
                {s.label}
              </span>
              {s.planned && (
                <span className="text-[10px] text-muted-foreground">
                  规划中
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <span className="mx-0.5 h-px w-3 bg-border" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
