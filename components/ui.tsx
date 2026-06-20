import clsx from "clsx";
import { LightKun } from "@/components/brand/LightKun";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "green" | "red" | "yellow" | "blue";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-800 text-ink-200 border border-ink-700",
    brand: "bg-brand-500/15 text-brand-300 border border-brand-500/30",
    green: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    red: "bg-red-500/15 text-red-300 border border-red-500/30",
    yellow: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    blue: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  };
  return <span className={clsx("badge", tones[tone], className)}>{children}</span>;
}

/** 軽量なインラインSVGスパークライン（KPIカード用） */
export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length < 2) return null;
  const w = 100;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = `M${pts.join(" L")}`;
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden>
      <path d={area} fill="#FF6A13" fillOpacity="0.12" />
      <path d={line} fill="none" stroke="#FF6A13" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
  delta,
  spark,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: boolean;
  delta?: number;
  spark?: number[];
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const up = (delta ?? 0) >= 0;
  return (
    <div className="stat-card">
      {accent && <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" />}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-ink-400">{label}</p>
        {hasDelta && (
          <span
            className={clsx(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
              up ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
            )}
            title="直近7日 vs 前7日"
          >
            {up ? "▲" : "▼"}
            {Math.abs(delta as number)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink-50 sm:text-3xl">{value}</p>
      {spark && spark.length > 1 && <Sparkline data={spark} className="mt-2 h-7 w-full" />}
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-ink-50 sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-ink-400">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** ライトくん付きの案内バナー（各ページ上部の説明に使用） */
export function GuideBanner({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn";
}) {
  return (
    <div
      className={clsx(
        "mb-6 flex items-start gap-3 rounded-2xl border p-4",
        tone === "warn"
          ? "border-brand-500/30 bg-brand-500/[0.06]"
          : "border-ink-800 bg-ink-900/50"
      )}
    >
      <LightKun className="h-14 w-auto shrink-0" />
      <div className="text-sm leading-relaxed text-ink-200">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-ink-900/30 px-6 py-12 text-center">
      <LightKun className="h-20 w-auto opacity-90" />
      <p className="text-sm font-medium text-ink-200">{title}</p>
      {hint && <p className="max-w-sm text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
